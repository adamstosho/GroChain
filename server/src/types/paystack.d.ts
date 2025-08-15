declare module '@paystack/paystack-sdk' {
  export class Paystack {
    constructor(secretKey: string, environment?: 'live' | 'test');
    
    transaction: {
      initialize(data: {
        email: string;
        name?: string;
        amount: number;
        reference: string;
        metadata?: any;
        callback_url?: string;
      }): Promise<any>;
      
      verify(reference: string): Promise<any>;
    };
  }
}


