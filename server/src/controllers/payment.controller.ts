import { Request, Response } from 'express';
import { Order } from '../models/order.model';
import { initializePayment, verifyPayment } from '../utils/paystack.util';
import { v4 as uuidv4 } from 'uuid';

export const initializeOrderPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, email } = req.body;
    const order = await Order.findById(orderId).populate('buyer');
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }
    const reference = `GROCHAIN_${uuidv4()}`;
    const payment = await initializePayment(email, order.total, reference, { orderId });
    return res.status(200).json({ status: 'success', payment });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Payment initialization failed.' });
  }
};

export const verifyPaymentWebhook = async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;
    const verification = await verifyPayment(reference);
    if (verification.data.status === 'success') {
      const orderId = verification.data.metadata.orderId;
      await Order.findByIdAndUpdate(orderId, { status: 'paid' });
      // TODO: Send notifications to buyer and seller
    }
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Payment verification failed.' });
  }
};
