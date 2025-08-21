import { logger } from '../utils/logger';
import axios from 'axios';
import USSD from '../models/ussd.model';
import USSDSession from '../models/ussdSession.model';

export interface USSDRequest {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
  networkCode?: string;
}

export interface USSDResponse {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
  response: string;
  shouldClose: boolean;
}

export interface USSDMenu {
  id: string;
  title: string;
  options: USSDMenuItem[];
  backOption?: boolean;
  exitOption?: boolean;
}

export interface USSDMenuItem {
  key: string;
  text: string;
  action: string;
  nextMenu?: string;
  requiresAuth?: boolean;
}

export interface USSDUserSession {
  sessionId: string;
  phoneNumber: string;
  currentMenu: string;
  userData: any;
  lastActivity: Date;
  step: number;
}

class USSDService {
  private readonly africastalkingApiKey = process.env.AFRICASTALKING_API_KEY;
  private readonly africastalkingUsername = process.env.AFRICASTALKING_USERNAME;
  private readonly africastalkingBaseUrl = 'https://api.africastalking.com/version1/ussd';

  /**
   * Process USSD request and return appropriate response
   */
  async processUSSDRequest(request: USSDRequest): Promise<USSDResponse> {
    try {
      logger.info({ sessionId: request.sessionId, phoneNumber: request.phoneNumber }, 'Processing USSD request');

      const { sessionId, phoneNumber, serviceCode, text } = request;
      
      // Parse user input
      const userInput = this.parseUserInput(text);
      const currentStep = userInput.length;

      // Get or create user session
      let session = await this.getUserSession(sessionId, phoneNumber);
      
      // Determine current menu based on step and input
      const currentMenu = this.determineCurrentMenu(session, userInput, currentStep);
      
      // Process user selection
      const response = await this.processUserSelection(session, currentMenu, userInput, currentStep);
      
      // Update session
      await this.updateUserSession(session, currentMenu, userInput, currentStep);

      return {
        sessionId,
        phoneNumber,
        serviceCode,
        text,
        response,
        shouldClose: response.includes('Thank you') || response.includes('Goodbye')
      };

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'USSD processing error');
      
      return {
        sessionId: request.sessionId,
        phoneNumber: request.phoneNumber,
        serviceCode: request.serviceCode,
        text: request.text,
        response: 'Sorry, service temporarily unavailable. Please try again later.',
        shouldClose: true
      };
    }
  }

  /**
   * Parse user input from USSD text
   */
  private parseUserInput(text: string): string[] {
    if (!text || text === '') return [];
    return text.split('*').filter(item => item.trim() !== '');
  }

  /**
   * Get or create user session
   */
  private async getUserSession(sessionId: string, phoneNumber: string): Promise<USSDUserSession> {
    const existing = await USSDSession.findActiveById(sessionId) as any
    if (existing) {
      return {
        sessionId: existing.sessionId,
        phoneNumber: existing.phoneNumber,
        currentMenu: existing.currentMenu,
        userData: existing.userData || {},
        lastActivity: existing.lastActivity || new Date(),
        step: existing.step || 0,
      }
    }
    const created = await USSDSession.create({ sessionId, phoneNumber, currentMenu: 'main', userData: {}, step: 0 })
    return {
      sessionId: created.sessionId,
      phoneNumber: created.phoneNumber,
      currentMenu: created.currentMenu,
      userData: created.userData || {},
      lastActivity: created.lastActivity || new Date(),
      step: created.step || 0,
    }
  }

  /**
   * Determine current menu based on user input and step
   */
  private determineCurrentMenu(session: USSDUserSession, userInput: string[], currentStep: number): string {
    if (currentStep === 0) return 'main';
    
    const lastInput = userInput[userInput.length - 1];
    
    switch (session.currentMenu) {
      case 'main':
        return this.getMainMenuSelection(lastInput);
      case 'harvest':
        return this.getHarvestMenuSelection(lastInput);
      case 'marketplace':
        return this.getMarketplaceMenuSelection(lastInput);
      case 'fintech':
        return this.getFintechMenuSelection(lastInput);
      case 'support':
        return this.getSupportMenuSelection(lastInput);
      default:
        return 'main';
    }
  }

  /**
   * Get main menu selection
   */
  private getMainMenuSelection(input: string): string {
    switch (input) {
      case '1': return 'harvest';
      case '2': return 'marketplace';
      case '3': return 'fintech';
      case '4': return 'support';
      case '5': return 'profile';
      default: return 'main';
    }
  }

  /**
   * Get harvest menu selection
   */
  private getHarvestMenuSelection(input: string): string {
    switch (input) {
      case '1': return 'log_harvest';
      case '2': return 'view_harvests';
      case '3': return 'harvest_analytics';
      case '0': return 'main';
      default: return 'harvest';
    }
  }

  /**
   * Get marketplace menu selection
   */
  private getMarketplaceMenuSelection(input: string): string {
    switch (input) {
      case '1': return 'browse_products';
      case '2': return 'my_orders';
      case '3': return 'sell_product';
      case '0': return 'main';
      default: return 'marketplace';
    }
  }

  /**
   * Get fintech menu selection
   */
  private getFintechMenuSelection(input: string): string {
    switch (input) {
      case '1': return 'check_credit';
      case '2': return 'apply_loan';
      case '3': return 'payment_history';
      case '0': return 'main';
      default: return 'fintech';
    }
  }

  /**
   * Get support menu selection
   */
  private getSupportMenuSelection(input: string): string {
    switch (input) {
      case '1': return 'contact_support';
      case '2': return 'faq';
      case '3': return 'training';
      case '0': return 'main';
      default: return 'support';
    }
  }

  /**
   * Process user selection and generate response
   */
  private async processUserSelection(session: USSDUserSession, currentMenu: string, userInput: string[], currentStep: number): Promise<string> {
    switch (currentMenu) {
      case 'main':
        return this.getMainMenu();
      case 'harvest':
        return this.getHarvestMenu();
      case 'marketplace':
        return this.getMarketplaceMenu();
      case 'fintech':
        return this.getFintechMenu();
      case 'support':
        return this.getSupportMenu();
      case 'log_harvest':
        return await this.processHarvestLogging(session, userInput, currentStep);
      case 'browse_products':
        return await this.processProductBrowsing(session, userInput, currentStep);
      case 'check_credit':
        return await this.processCreditCheck(session, userInput, currentStep);
      case 'contact_support':
        return this.processContactSupport(session, userInput, currentStep);
      default:
        return this.getMainMenu();
    }
  }

  /**
   * Get main menu
   */
  private getMainMenu(): string {
    return `CON Welcome to GroChain USSD Service

1. Harvest Management
2. Marketplace
3. Financial Services
4. Support & Training
5. My Profile

0. Exit

Reply with option number`;
  }

  /**
   * Get harvest menu
   */
  private getHarvestMenu(): string {
    return `CON Harvest Management

1. Log New Harvest
2. View My Harvests
3. Harvest Analytics

0. Back to Main Menu

Reply with option number`;
  }

  /**
   * Get marketplace menu
   */
  private getMarketplaceMenu(): string {
    return `CON Marketplace

1. Browse Products
2. My Orders
3. Sell Product

0. Back to Main Menu

Reply with option number`;
  }

  /**
   * Get fintech menu
   */
  private getFintechMenu(): string {
    return `CON Financial Services

1. Check Credit Score
2. Apply for Loan
3. Payment History

0. Back to Main Menu

Reply with option number`;
  }

  /**
   * Get support menu
   */
  private getSupportMenu(): string {
    return `CON Support & Training

1. Contact Support
2. FAQ
3. Training Resources

0. Back to Main Menu

Reply with option number`;
  }

  /**
   * Process harvest logging
   */
  private async processHarvestLogging(session: USSDUserSession, userInput: string[], currentStep: number): Promise<string> {
    if (currentStep === 1) {
      return `CON Log New Harvest

Enter crop type:
1. Maize
2. Rice
3. Cassava
4. Yam
5. Other

Reply with option number or type crop name`;
    }

    if (currentStep === 2) {
      const cropType = userInput[1];
      session.userData.cropType = cropType;
      
      return `CON Enter harvest quantity (in kg)

Example: 500

Reply with quantity`;
    }

    if (currentStep === 3) {
      const quantity = userInput[2];
      session.userData.quantity = quantity;
      
      return `CON Enter harvest date

Format: DD/MM/YYYY
Example: 15/08/2024

Reply with date`;
    }

    if (currentStep === 4) {
      const date = userInput[3];
      session.userData.harvestDate = date;
      
      // Here you would save to database
      logger.info({ 
        phoneNumber: session.phoneNumber, 
        harvestData: session.userData 
      }, 'Harvest logged via USSD');
      
      return `END Harvest logged successfully!

Crop: ${session.userData.cropType}
Quantity: ${session.userData.quantity} kg
Date: ${session.userData.harvestDate}

Thank you for using GroChain USSD Service!`;
    }

    return this.getMainMenu();
  }

  /**
   * Process product browsing
   */
  private async processProductBrowsing(session: USSDUserSession, userInput: string[], currentStep: number): Promise<string> {
    if (currentStep === 1) {
      return `CON Browse Products

1. Grains & Cereals
2. Tubers & Roots
3. Vegetables
4. Fruits
5. Livestock

Reply with option number`;
    }

    if (currentStep === 2) {
      const category = userInput[1];
      session.userData.category = category;
      
      // Mock products - in production, query database
      const products = this.getMockProducts(category);
      
      let response = `CON Available Products\n\n`;
      products.forEach((product, index) => {
        response += `${index + 1}. ${product.name} - ₦${product.price}/kg\n`;
      });
      response += `\n0. Back to Marketplace\n\nReply with product number`;
      
      return response;
    }

    if (currentStep === 3) {
      const productIndex = parseInt(userInput[2]) - 1;
      const products = this.getMockProducts(session.userData.category);
      const product = products[productIndex];
      
      if (product) {
        return `END Product Details

${product.name}
Price: ₦${product.price}/kg
Location: ${product.location}
Seller: ${product.seller}

To order, call: +234 800 GROCHAIN
Or visit: grochain.ng

Thank you for using GroChain USSD!`;
      }
    }

    return this.getMainMenu();
  }

  /**
   * Process credit check
   */
  private async processCreditCheck(session: USSDUserSession, userInput: string[], currentStep: number): Promise<string> {
    if (currentStep === 1) {
      return `CON Credit Score Check

Enter your BVN (11 digits):

Reply with your BVN`;
    }

    if (currentStep === 2) {
      const bvn = userInput[1];
      
      // Mock credit score - in production, query credit scoring service
      const creditScore = Math.floor(Math.random() * 300) + 300; // 300-600
      const status = creditScore >= 500 ? 'Good' : creditScore >= 400 ? 'Fair' : 'Poor';
      
      return `END Credit Score Report

Your Credit Score: ${creditScore}
Status: ${status}

Score Range:
300-399: Poor
400-499: Fair
500-600: Good

For loan applications, call: +234 800 GROCHAIN

Thank you for using GroChain USSD!`;
    }

    return this.getMainMenu();
  }

  /**
   * Process contact support
   */
  private processContactSupport(session: USSDUserSession, userInput: string[], currentStep: number): string {
    return `END Contact Support

Our team is here to help!

📞 Call: +234 800 GROCHAIN
📧 Email: support@grochain.ng
🌐 Website: grochain.ng

Office Hours: 8AM - 6PM (WAT)
Emergency: 24/7

Thank you for using GroChain USSD Service!`;
  }

  /**
   * Get mock products for demonstration
   */
  private getMockProducts(category: string): Array<{name: string, price: number, location: string, seller: string}> {
    const products: Record<string, Array<{name: string, price: number, location: string, seller: string}>> = {
      '1': [ // Grains & Cereals
        { name: 'Premium Maize', price: 250, location: 'Kano', seller: 'Kano Farmers Coop' },
        { name: 'Quality Rice', price: 450, location: 'Kebbi', seller: 'Kebbi Rice Farmers' },
        { name: 'Organic Sorghum', price: 300, location: 'Bauchi', seller: 'Bauchi Organic Coop' }
      ],
      '2': [ // Tubers & Roots
        { name: 'Fresh Cassava', price: 150, location: 'Ondo', seller: 'Ondo Cassava Coop' },
        { name: 'Premium Yam', price: 400, location: 'Benue', seller: 'Benue Yam Farmers' },
        { name: 'Sweet Potato', price: 200, location: 'Plateau', seller: 'Plateau Potato Coop' }
      ],
      '3': [ // Vegetables
        { name: 'Fresh Tomatoes', price: 300, location: 'Kano', seller: 'Kano Veg Coop' },
        { name: 'Green Peppers', price: 250, location: 'Kaduna', seller: 'Kaduna Farmers' },
        { name: 'Onions', price: 180, location: 'Sokoto', seller: 'Sokoto Onion Coop' }
      ],
      '4': [ // Fruits
        { name: 'Sweet Oranges', price: 120, location: 'Benue', seller: 'Benue Fruit Coop' },
        { name: 'Fresh Mangoes', price: 200, location: 'Kebbi', seller: 'Kebbi Mango Farmers' },
        { name: 'Pineapples', price: 150, location: 'Ondo', seller: 'Ondo Pineapple Coop' }
      ],
      '5': [ // Livestock
        { name: 'Live Chickens', price: 2500, location: 'Oyo', seller: 'Oyo Poultry Coop' },
        { name: 'Fresh Eggs', price: 50, location: 'Lagos', seller: 'Lagos Egg Farmers' },
        { name: 'Goat Meat', price: 800, location: 'Kano', seller: 'Kano Livestock Coop' }
      ]
    };

    return products[category] || [];
  }

  /**
   * Update user session
   */
  private async updateUserSession(session: USSDUserSession, currentMenu: string, userInput: string[], currentStep: number): Promise<void> {
    session.currentMenu = currentMenu;
    session.step = currentStep;
    session.lastActivity = new Date();
    await USSDSession.findOneAndUpdate(
      { sessionId: session.sessionId },
      { currentMenu, step: currentStep, lastActivity: new Date(), userData: session.userData, isActive: true },
      { upsert: true }
    )
    logger.info({ sessionId: session.sessionId, currentMenu, step: currentStep }, 'USSD session updated');
  }

  /**
   * Send USSD response via Africa's Talking API
   */
  async sendUSSDResponse(response: USSDResponse): Promise<boolean> {
    try {
      if (!this.africastalkingApiKey) {
        logger.warn('Africa\'s Talking API key not configured, using mock response');
        return true;
      }

      const payload = {
        sessionId: response.sessionId,
        phoneNumber: response.phoneNumber,
        text: response.response,
        serviceCode: response.serviceCode
      };

      const result = await axios.post(this.africastalkingBaseUrl, payload, {
        headers: {
          'apiKey': this.africastalkingApiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return result.status === 200;
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Failed to send USSD response');
      return false;
    }
  }

  /**
   * Get active USSD sessions
   */
  async getActiveSessions(): Promise<any[]> {
    try {
      const sessions = await USSDSession.find({ isActive: true })
        .sort({ lastActivity: -1 })
        .limit(50)
        .lean();

      return sessions.map(session => ({
        sessionId: session.sessionId,
        phoneNumber: session.phoneNumber,
        status: session.isActive ? 'active' : 'completed',
        startTime: session.createdAt,
        lastActivity: session.lastActivity,
        currentMenu: session.currentMenu,
        network: this.detectNetwork(session.phoneNumber),
        step: session.step
      }));
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting active USSD sessions');
      return [];
    }
  }

  /**
   * Detect network from phone number
   */
  private detectNetwork(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/^\+234|^0/, '');
    const prefix = cleanNumber.substring(0, 2);
    
    const networks: Record<string, string> = {
      '80': 'MTN',
      '81': 'MTN',
      '90': 'Glo',
      '91': 'Glo',
      '70': 'Airtel',
      '71': 'Airtel',
      '89': '9mobile',
      '99': '9mobile'
    };
    
    return networks[prefix] || 'Unknown';
  }

  /**
   * Get USSD service code for registration
   */
  getServiceCode(): string {
    return process.env.USSD_SERVICE_CODE || '*123*456#';
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Nigerian phone number validation
    const nigerianPhoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return nigerianPhoneRegex.test(phoneNumber);
  }
}

export default new USSDService();
