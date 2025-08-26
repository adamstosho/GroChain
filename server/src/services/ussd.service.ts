import { User, UserRole } from '../models/user.model';
import { Partner } from '../models/partner.model';
import { Harvest } from '../models/harvest.model';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { sendSMS } from './notification.service';

export interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

export interface USSDResponse {
  sessionId: string;
  message: string;
  status: 'continue' | 'end';
}

export interface USSDMenu {
  id: string;
  title: string;
  options: USSDMenuItem[];
}

export interface USSDMenuItem {
  id: string;
  text: string;
  nextMenu?: string;
  action?: string;
}

class USSDService {
  private sessions: Map<string, any> = new Map();
  private menus: Map<string, USSDMenu> = new Map();

  constructor() {
    this.initializeMenus();
  }

  private initializeMenus() {
    // Main Menu
    this.menus.set('main', {
      id: 'main',
      title: 'GroChain - Digital Agriculture',
      options: [
        { id: '1', text: 'Harvest Management', nextMenu: 'harvest' },
        { id: '2', text: 'Marketplace', nextMenu: 'marketplace' },
        { id: '3', text: 'Financial Services', nextMenu: 'financial' },
        { id: '4', text: 'Support & Training', nextMenu: 'support' },
        { id: '5', text: 'My Profile', nextMenu: 'profile' },
        { id: '0', text: 'Exit', action: 'exit' }
      ]
    });

    // Harvest Menu
    this.menus.set('harvest', {
      id: 'harvest',
      title: 'Harvest Management',
      options: [
        { id: '1', text: 'Log New Harvest', action: 'log_harvest' },
        { id: '2', text: 'View My Harvests', action: 'view_harvests' },
        { id: '3', text: 'Harvest Analytics', action: 'harvest_analytics' },
        { id: '9', text: 'Back to Main Menu', nextMenu: 'main' },
        { id: '0', text: 'Exit', action: 'exit' }
      ]
    });

    // Marketplace Menu
    this.menus.set('marketplace', {
      id: 'marketplace',
      title: 'Marketplace',
      options: [
        { id: '1', text: 'Browse Products', action: 'browse_products' },
        { id: '2', text: 'My Orders', action: 'my_orders' },
        { id: '3', text: 'Sell Product', action: 'sell_product' },
        { id: '9', text: 'Back to Main Menu', nextMenu: 'main' },
        { id: '0', text: 'Exit', action: 'exit' }
      ]
    });

    // Financial Services Menu
    this.menus.set('financial', {
      id: 'financial',
      title: 'Financial Services',
      options: [
        { id: '1', text: 'Check Credit Score', action: 'credit_score' },
        { id: '2', text: 'Apply for Loan', action: 'apply_loan' },
        { id: '3', text: 'Payment History', action: 'payment_history' },
        { id: '9', text: 'Back to Main Menu', nextMenu: 'main' },
        { id: '0', text: 'Exit', action: 'exit' }
      ]
    });

    // Support Menu
    this.menus.set('support', {
      id: 'support',
      title: 'Support & Training',
      options: [
        { id: '1', text: 'Contact Support', action: 'contact_support' },
        { id: '2', text: 'FAQ', action: 'faq' },
        { id: '3', text: 'Training Videos', action: 'training' },
        { id: '9', text: 'Back to Main Menu', nextMenu: 'main' },
        { id: '0', text: 'Exit', action: 'exit' }
      ]
    });

    // Profile Menu
    this.menus.set('profile', {
      id: 'profile',
      title: 'My Profile',
      options: [
        { id: '1', text: 'View Profile', action: 'view_profile' },
        { id: '2', text: 'Update Profile', action: 'update_profile' },
        { id: '3', text: 'Change Language', action: 'change_language' },
        { id: '9', text: 'Back to Main Menu', nextMenu: 'main' },
        { id: '0', text: 'Exit', action: 'exit' }
      ]
    });
  }

  async processRequest(request: USSDRequest): Promise<USSDResponse> {
    try {
      const { sessionId, serviceCode, phoneNumber, text } = request;
      
      // Get or create session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = {
          phoneNumber,
          currentMenu: 'main',
          data: {},
          step: 0
        };
        this.sessions.set(sessionId, session);
      }

      // Process the request
      const response = await this.processMenuNavigation(session, text);
      
      // Update session
      this.sessions.set(sessionId, session);
      
      return {
        sessionId,
        message: response.message,
        status: response.status
      };
    } catch (error) {
      console.error('USSD processing error:', error);
      return {
        sessionId: request.sessionId,
        message: 'Sorry, an error occurred. Please try again.',
        status: 'end'
      };
    }
  }

  private async processMenuNavigation(session: any, input: string): Promise<{ message: string; status: 'continue' | 'end' }> {
    const { currentMenu, step, data } = session;

    // Handle special inputs
    if (input === '0') {
      return { message: 'Thank you for using GroChain. Goodbye!', status: 'end' };
    }

    if (input === '9') {
      session.currentMenu = 'main';
      session.step = 0;
      return this.displayMenu('main');
    }

    // Handle menu navigation
    const menu = this.menus.get(currentMenu);
    if (!menu) {
      session.currentMenu = 'main';
      return this.displayMenu('main');
    }

    // Handle actions
    if (step === 0) {
      const option = menu.options.find(opt => opt.id === input);
      if (!option) {
        return { message: 'Invalid option. Please try again.', status: 'continue' };
      }

      if (option.action) {
        return this.executeAction(session, option.action, data);
      } else if (option.nextMenu) {
        session.currentMenu = option.nextMenu;
        return this.displayMenu(option.nextMenu);
      }
    }

    // Handle multi-step actions
    return this.handleMultiStepAction(session, input);
  }

  private displayMenu(menuId: string): { message: string; status: 'continue' } {
    const menu = this.menus.get(menuId);
    if (!menu) {
      return { message: 'Menu not found.', status: 'continue' };
    }

    let message = `${menu.title}\n\n`;
    menu.options.forEach(option => {
      message += `${option.id}. ${option.text}\n`;
    });

    return { message, status: 'continue' };
  }

  private async executeAction(session: any, action: string, data: any): Promise<{ message: string; status: 'continue' | 'end' }> {
    switch (action) {
      case 'log_harvest':
        return this.handleLogHarvest(session);
      
      case 'view_harvests':
        return this.handleViewHarvests(session);
      
      case 'browse_products':
        return this.handleBrowseProducts(session);
      
      case 'credit_score':
        return this.handleCreditScore(session);
      
      case 'contact_support':
        return this.handleContactSupport(session);
      
      case 'exit':
        return { message: 'Thank you for using GroChain. Goodbye!', status: 'end' };
      
      default:
        return { message: 'Action not implemented yet. Please try another option.', status: 'continue' };
    }
  }

  private async handleLogHarvest(session: any): Promise<{ message: string; status: 'continue' | 'end' }> {
    session.currentMenu = 'log_harvest';
    session.step = 1;
    session.data = {};

    return {
      message: 'Log New Harvest\n\n1. Enter crop type (e.g., Cassava, Yam, Rice):',
      status: 'continue'
    };
  }

  private async handleViewHarvests(session: any): Promise<{ message: string; status: 'continue' | 'end' }> {
    try {
      const user = await User.findOne({ phone: session.phoneNumber });
      if (!user) {
        return { message: 'User not found. Please register first.', status: 'end' };
      }

      const harvests = await Harvest.find({ farmer: user._id }).limit(5);
      
      if (harvests.length === 0) {
        return { message: 'No harvests found. Log your first harvest to get started!', status: 'end' };
      }

      let message = 'Your Recent Harvests:\n\n';
      harvests.forEach((harvest, index) => {
        message += `${index + 1}. ${harvest.cropType} - ${harvest.quantity}kg\n`;
        message += `   Date: ${harvest.date.toLocaleDateString()}\n`;
        message += `   Status: ${harvest.status}\n\n`;
      });

      message += '9. Back to Main Menu\n0. Exit';
      
      return { message, status: 'continue' };
    } catch (error) {
      console.error('Error fetching harvests:', error);
      return { message: 'Error fetching harvests. Please try again.', status: 'continue' };
    }
  }

  private async handleBrowseProducts(session: any): Promise<{ message: string; status: 'continue' | 'end' }> {
    try {
      const products = await Product.find({ status: 'active' }).limit(5);
      
      if (products.length === 0) {
        return { message: 'No products available in the marketplace.', status: 'end' };
      }

      let message = 'Available Products:\n\n';
      products.forEach((product, index) => {
        message += `${index + 1}. ${product.name}\n`;
        message += `   Price: ₦${product.price}/kg\n`;
        message += `   Category: ${product.category}\n\n`;
      });

      message += '9. Back to Main Menu\n0. Exit';
      
      return { message, status: 'continue' };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { message: 'Error fetching products. Please try again.', status: 'continue' };
    }
  }

  private async handleCreditScore(session: any): Promise<{ message: string; status: 'continue' | 'end' }> {
    try {
      const user = await User.findOne({ phone: session.phoneNumber });
      if (!user) {
        return { message: 'User not found. Please register first.', status: 'end' };
      }

      // Mock credit score calculation
      const creditScore = Math.floor(Math.random() * 500) + 300; // 300-800 range
      const rating = creditScore >= 700 ? 'Excellent' : creditScore >= 600 ? 'Good' : creditScore >= 500 ? 'Fair' : 'Poor';

      const message = `Your Credit Score\n\nScore: ${creditScore}\nRating: ${rating}\n\nThis score helps determine your loan eligibility and terms.\n\n9. Back to Main Menu\n0. Exit`;

      return { message, status: 'continue' };
    } catch (error) {
      console.error('Error calculating credit score:', error);
      return { message: 'Error calculating credit score. Please try again.', status: 'continue' };
    }
  }

  private async handleContactSupport(session: any): Promise<{ message: string; status: 'continue' | 'end' }> {
    const message = `Contact Support\n\nPhone: +234 800 GROCHAIN\nEmail: support@grochain.ng\nWhatsApp: +234 800 GROCHAIN\n\nOur support team is available 24/7 to help you.\n\n9. Back to Main Menu\n0. Exit`;

    return { message, status: 'continue' };
  }

  private async handleMultiStepAction(session: any, input: string): Promise<{ message: string; status: 'continue' | 'end' }> {
    const { currentMenu, step, data } = session;

    if (currentMenu === 'log_harvest') {
      return this.handleHarvestLogging(session, input, step, data);
    }

    return { message: 'Invalid input. Please try again.', status: 'continue' };
  }

  private async handleHarvestLogging(session: any, input: string, step: number, data: any): Promise<{ message: string; status: 'continue' | 'end' }> {
    switch (step) {
      case 1:
        data.cropType = input;
        session.step = 2;
        return {
          message: `Crop Type: ${input}\n\n2. Enter quantity in kg:`,
          status: 'continue'
        };

      case 2:
        const quantity = parseFloat(input);
        if (isNaN(quantity) || quantity <= 0) {
          return {
            message: 'Invalid quantity. Please enter a valid number:',
            status: 'continue'
          };
        }
        data.quantity = quantity;
        session.step = 3;
        return {
          message: `Quantity: ${quantity}kg\n\n3. Enter harvest date (DD/MM/YYYY):`,
          status: 'continue'
        };

      case 3:
        const dateMatch = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!dateMatch) {
          return {
            message: 'Invalid date format. Please use DD/MM/YYYY:',
            status: 'continue'
          };
        }
        data.harvestDate = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
        session.step = 4;
        return {
          message: `Date: ${data.harvestDate.toLocaleDateString()}\n\n4. Enter location (e.g., Lagos, Kano):`,
          status: 'continue'
        };

      case 4:
        data.location = input;
        session.step = 5;
        return {
          message: `Location: ${input}\n\n5. Enter notes (optional) or send "none":`,
          status: 'continue'
        };

      case 5:
        data.notes = input === 'none' ? '' : input;
        
        // Save harvest to database
        try {
          const user = await User.findOne({ phone: session.phoneNumber });
          if (!user) {
            return { message: 'User not found. Please register first.', status: 'end' };
          }

          const harvest = new Harvest({
            farmer: user._id,
            cropType: data.cropType,
            quantity: data.quantity,
            harvestDate: data.harvestDate,
            location: data.location,
            notes: data.notes,
            status: 'pending',
            batchId: `H${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
          });

          await harvest.save();

          // Send confirmation SMS
          await sendSMS(session.phoneNumber, `Harvest logged successfully! Batch ID: ${harvest.batchId}. Crop: ${data.cropType}, Quantity: ${data.quantity}kg`);

          const message = `✅ Harvest Logged Successfully!\n\nBatch ID: ${harvest.batchId}\nCrop: ${data.cropType}\nQuantity: ${data.quantity}kg\nDate: ${data.harvestDate.toLocaleDateString()}\nLocation: ${data.location}\n\nThank you for using GroChain!\n\n9. Back to Main Menu\n0. Exit`;

          // Reset session
          session.currentMenu = 'main';
          session.step = 0;
          session.data = {};

          return { message, status: 'continue' };
        } catch (error) {
          console.error('Error saving harvest:', error);
          return { message: 'Error saving harvest. Please try again.', status: 'end' };
        }

      default:
        return { message: 'Invalid step. Please start over.', status: 'continue' };
    }
  }

  // Clean up old sessions
  cleanupSessions() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity && (now - session.lastActivity) > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Get session statistics
  getSessionStats() {
    return {
      activeSessions: this.sessions.size,
      totalMenus: this.menus.size
    };
  }
}

export const ussdService = new USSDService();

// Clean up sessions every 5 minutes
setInterval(() => {
  ussdService.cleanupSessions();
}, 5 * 60 * 1000);

