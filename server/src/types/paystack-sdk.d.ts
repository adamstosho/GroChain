declare module '@paystack/paystack-sdk' {
  export class Paystack {
    constructor(secretKey: string, environment?: 'test' | 'live');
    
    transaction: {
      initialize(data: {
        amount: number;
        email: string;
        reference: string;
        callback_url?: string;
        currency?: string;
        metadata?: any;
      }): Promise<{
        status: boolean;
        message: string;
        data: {
          authorization_url: string;
          access_code: string;
          reference: string;
        };
      }>;
      
      verify(reference: string): Promise<{
        status: boolean;
        message: string;
        data: {
          id: number;
          domain: string;
          amount: number;
          currency: string;
          status: string;
          reference: string;
          metadata: any;
          gateway_response: string;
          channel: string;
          ip_address: string;
          fees: number;
          customer: {
            id: number;
            customer_code: string;
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            metadata: any;
            risk_action: string;
            international_format_phone: string;
          };
          created_at: string;
          updated_at: string;
          paid_at: string;
          transaction_date: string;
        };
      }>;
    };
    
    customer: {
      create(data: {
        email: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
        metadata?: any;
      }): Promise<{
        status: boolean;
        message: string;
        data: any;
      }>;
    };
    
    plan: {
      create(data: {
        name: string;
        amount: number;
        interval: string;
        currency?: string;
        description?: string;
      }): Promise<{
        status: boolean;
        message: string;
        data: any;
      }>;
    };
    
    subscription: {
      create(data: {
        customer: string;
        plan: string;
        start_date?: string;
      }): Promise<{
        status: boolean;
        message: string;
        data: any;
      }>;
    };
  }
}
