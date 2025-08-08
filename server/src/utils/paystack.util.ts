import Paystack from 'paystack';

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY as string);

export const initializePayment = async (email: string, amount: number, reference: string, metadata?: any) => {
  try {
    const response = await paystack.transaction.initialize({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata,
      callback_url: `${process.env.BASE_URL}/api/payments/verify`,
    });
    return response;
  } catch (error) {
    throw new Error('Failed to initialize payment');
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await paystack.transaction.verify(reference);
    return response;
  } catch (error) {
    throw new Error('Failed to verify payment');
  }
};
