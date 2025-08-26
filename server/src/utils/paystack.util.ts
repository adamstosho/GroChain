// @ts-ignore
import Paystack from '@paystack/paystack-sdk';

// Initialize Paystack with secret key
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '');

export const initializePayment = async (email: string, amount: number, reference: string, metadata?: any, name?: string) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await paystack.transaction.initialize({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata,
      callback_url: `${process.env.BASE_URL}/api/payments/verify`,
      currency: 'NGN'
    });
    
    console.log('Paystack payment initialized:', response);
    return response;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw error;
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await paystack.transaction.verify(reference);
    console.log('Paystack payment verified:', response);
    return response;
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw error;
  }
};

export const isPaystackConfigured = (): boolean => {
  return !!(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_PUBLIC_KEY);
};

export const getPaystackConfig = () => {
  return {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
    secretKey: process.env.PAYSTACK_SECRET_KEY ? '***CONFIGURED***' : null,
    baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET ? '***CONFIGURED***' : null
  };
};

export const getTransactionStatus = async (reference: string) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await paystack.transaction.verify(reference);
    return {
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
      reference: response.data.reference,
      metadata: response.data.metadata
    };
  } catch (error) {
    console.error('Paystack transaction status error:', error);
    throw error;
  }
};
