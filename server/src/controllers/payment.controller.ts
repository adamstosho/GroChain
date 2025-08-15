import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Order } from '../models/order.model';
import { Transaction, TransactionStatus, TransactionType } from '../models/transaction.model';
import { initializePayment, verifyPayment } from '../utils/paystack.util';
import crypto from 'crypto';
import { CommissionService } from '../services/commission.service';
import { CreditScore } from '../models/creditScore.model';
import { v4 as uuidv4 } from 'uuid';
import { sendNotification } from '../services/notification.service';
import { webSocketService } from '../services/websocket.service';
import { Listing } from '../models/listing.model';

export const initializeOrderPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, email } = req.body;
    const order = await Order.findById(orderId).populate('buyer');
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }
    // Ensure the initiating user owns the order or has privileged role
    if (req.user?.role === 'buyer' && String(order.buyer) !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    const reference = `GROCHAIN_${uuidv4()}`;
    const payment = await initializePayment(email, order.total, reference, { orderId });
    // Record payment transaction (pending)
    await Transaction.create({
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      amount: order.total,
      currency: 'NGN',
      reference,
      description: `Payment for order ${orderId}`,
      userId: order.buyer as any,
      orderId: order._id as any,
      paymentProvider: 'paystack',
      paymentProviderReference: reference,
      metadata: { orderId }
    });
    return res.status(200).json({ status: 'success', payment });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Payment initialization failed.' });
  }
};

export const verifyPaymentWebhook = async (req: Request, res: Response) => {
  try {
    // Verify Paystack signature
    const signature = req.headers['x-paystack-signature'] as string | undefined;
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
    if (!signature || !webhookSecret) {
      // In production, require signature; in non-prod we allow missing for local tests
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({ status: 'error', message: 'Missing webhook signature' });
      }
    } else {
      const hash = crypto
        .createHmac('sha512', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (hash !== signature) {
        return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
      }
    }

    const { reference } = req.body;
    // Idempotency: if transaction already completed for this reference, return success
    const existingTx = await Transaction.findOne({ reference, type: TransactionType.PAYMENT });
    if (existingTx && existingTx.status === TransactionStatus.COMPLETED) {
      return res.status(200).json({ status: 'success' });
    }

    const verification = await verifyPayment(reference);
    if (verification.data.status === 'success') {
      const orderId = verification.data.metadata.orderId;

      // Idempotency: atomically complete the transaction if it's still pending
      const completedTx = await Transaction.findOneAndUpdate(
        { reference, type: TransactionType.PAYMENT, status: TransactionStatus.PENDING },
        { status: TransactionStatus.COMPLETED, paymentProviderReference: reference, processedAt: new Date() },
        { new: true }
      );
      if (!completedTx) {
        // Already processed or no pending txn; return success idempotently
        return res.status(200).json({ status: 'success' });
      }

      // Update order status
      const order = await Order.findByIdAndUpdate(orderId, { status: 'paid' }, { new: true });
      if (order) {
        // Send real-time notification to buyer
        webSocketService.sendToUser(order.buyer as any, 'payment_completed', {
          orderId: order._id,
          amount: order.total,
          status: 'paid',
          timestamp: new Date()
        });

        // Send real-time notification to partner network
        if (order.items && order.items.length > 0) {
          const firstItem = order.items[0];
          if (firstItem.listing) {
            const listing = await Listing.findById(firstItem.listing);
            if (listing && listing.partner) {
              webSocketService.sendToPartnerNetwork(listing.partner as any, 'order_paid', {
                orderId: order._id,
                amount: order.total,
                farmer: listing.farmer,
                timestamp: new Date()
              });
            }
          }
        }

        // Apply 3% platform fee as a separate transaction
        const platformFeeRate = Number(process.env.PLATFORM_FEE_RATE || 0.03);
        const platformFeeAmount = Math.round(order.total * platformFeeRate);
        if (platformFeeAmount > 0) {
          await Transaction.create({
            type: TransactionType.PLATFORM_FEE,
            status: TransactionStatus.COMPLETED,
            amount: platformFeeAmount,
            currency: 'NGN',
            reference: `PLATFORM_FEE_${reference}`,
            description: `Platform fee for order ${orderId}`,
            userId: order.buyer as any,
            orderId: order._id as any,
            paymentProvider: 'system',
            paymentProviderReference: reference,
            metadata: { orderId, originalReference: reference, rate: platformFeeRate }
          });
        }

        // Commission: per-item based on listing.farmer
        const notifiedFarmers = new Set<string>();
        for (const item of order.items) {
          try {
            const listing = await Listing.findById(item.listing);
            if (!listing) continue;
            const commissionCalc = await CommissionService.calculateCommission(
              (listing.farmer as any).toString(),
              item.quantity * item.price,
              reference
            );
            if (commissionCalc) {
              await CommissionService.processCommission(commissionCalc);
            }

            // Notify seller (farmer) about order payment once
            const farmerId = (listing.farmer as any).toString();
            if (!notifiedFarmers.has(farmerId)) {
              notifiedFarmers.add(farmerId);
              try {
                await sendNotification(farmerId, 'sms', `Your listing received a paid order (Order ${orderId}).`);
              } catch {}
            }
          } catch (_) {
            // continue on per-item failure
          }
        }

        // Credit score: increment for buyer (if farmer-role scoring desired); keep simple by amount
        const increment = Math.round(order.total / 1000);
        await CreditScore.findOneAndUpdate(
          { farmer: order.buyer },
          {
            $inc: { score: increment },
            $push: { history: { transactionId: reference, amount: order.total, date: new Date() } }
          },
          { upsert: true }
        );

        // Notify buyer about successful payment
        try {
          await sendNotification((order.buyer as any).toString(), 'sms', `Your payment for order ${orderId} was successful.`);
        } catch {}
      }
    }
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Payment verification failed.' });
  }
};
