// import { Paystack } from '@paystack/paystack-sdk';

// Temporary stub implementation to get server running
// TODO: Fix type declarations and re-enable Paystack
const paystack = {
  transaction: {
    initialize: async (data: any) => {
      console.warn('Paystack integration temporarily disabled - using stub implementation');
      return {
        status: true,
        message: 'Payment initialization (stub)',
        data: {
          authorization_url: 'https://example.com/payment-stub',
          access_code: 'stub-access-code',
          reference: data.reference
        }
      };
    },
    verify: async (reference: string) => {
      console.warn('Paystack integration temporarily disabled - using stub implementation');
      return {
        status: true,
        message: 'Payment verification (stub)',
        data: {
          id: 12345,
          domain: 'test',
          amount: 1000,
          currency: 'NGN',
          status: 'success',
          reference: reference,
          metadata: { orderId: 'stub-order-id' }, // Include orderId for payment controller
          gateway_response: 'Approved',
          channel: 'card',
          ip_address: '127.0.0.1',
          fees: 0,
          customer: {
            id: 1,
            customer_code: 'CUS_stub',
            first_name: 'Test',
            last_name: 'Customer',
            email: 'test@example.com',
            phone: '+2348000000000',
            metadata: {},
            risk_action: 'default',
            international_format_phone: '+2348000000000'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          transaction_date: new Date().toISOString()
        }
      };
    }
  }
};

export const initializePayment = async (email: string, amount: number, reference: string, metadata?: any, name?: string) => {
  try {
    const response = await paystack.transaction.initialize({
      email,
      name: name || 'GroChain Customer',
      amount: amount * 100, // Convert to kobo
      reference,
      metadata,
      callback_url: `${process.env.BASE_URL}/api/payments/verify`,
    });
    return response;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw new Error('Failed to initialize payment');
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await paystack.transaction.verify(reference);
    return response;
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw new Error('Failed to verify payment');
  }
};
