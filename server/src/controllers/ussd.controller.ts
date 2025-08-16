import { Request, Response } from 'express';
import ussdService from '../services/ussd.service';
import { logger } from '../utils/logger';

export class USSDController {
  /**
   * Handle USSD requests from telecom providers
   * POST /api/ussd
   */
  async handleUSSDRequest(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, phoneNumber, serviceCode, text, networkCode } = req.body;

      // Validate required fields
      if (!sessionId || !phoneNumber || !serviceCode) {
        logger.warn('Invalid USSD request - missing required fields', req.body);
        res.status(400).json({
          status: 'error',
          message: 'Missing required fields: sessionId, phoneNumber, serviceCode'
        });
        return;
      }

      // Process USSD request
      const ussdRequest = {
        sessionId,
        phoneNumber,
        serviceCode,
        text: text || '',
        networkCode
      };

      const ussdResponse = await ussdService.processUSSDRequest(ussdRequest);

      // Return USSD response
      res.status(200).json({
        status: 'success',
        message: 'USSD request processed successfully',
        data: ussdResponse
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error handling USSD request');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error processing USSD request'
      });
    }
  }

  /**
   * Get USSD service information
   * GET /api/ussd/info
   */
  async getUSSDInfo(req: Request, res: Response): Promise<void> {
    try {
      const serviceCode = ussdService.getServiceCode();
      
      res.status(200).json({
        status: 'success',
        message: 'USSD service information retrieved successfully',
        data: {
          serviceCode,
          description: 'GroChain USSD Service for Rural Farmers',
          features: [
            'Harvest Management',
            'Marketplace Access',
            'Financial Services',
            'Support & Training'
          ],
          instructions: `Dial ${serviceCode} from any phone to access GroChain services`,
          supportedNetworks: ['MTN', 'Airtel', 'Glo', '9mobile'],
          languages: ['English', 'Hausa', 'Yoruba', 'Igbo']
        }
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting USSD info');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error retrieving USSD information'
      });
    }
  }

  /**
   * Test USSD service (for development)
   * POST /api/ussd/test
   */
  async testUSSDService(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, text } = req.body;

      if (!phoneNumber || !text) {
        res.status(400).json({
          status: 'error',
          message: 'Phone number and text are required'
        });
        return;
      }

      // Validate phone number
      if (!ussdService.validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid phone number format'
        });
        return;
      }

      // Create test USSD request
      const testRequest = {
        sessionId: `test_${Date.now()}`,
        phoneNumber,
        serviceCode: '*123*456#',
        text
      };

      // Process test request
      const testResponse = await ussdService.processUSSDRequest(testRequest);

      res.status(200).json({
        status: 'success',
        message: 'USSD test completed successfully',
        data: {
          request: testRequest,
          response: testResponse
        }
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error testing USSD service');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error during USSD testing'
      });
    }
  }

  /**
   * Get USSD usage statistics
   * GET /api/ussd/stats
   */
  async getUSSDStats(req: Request, res: Response): Promise<void> {
    try {
      // Mock statistics - in production, query database
      const stats = {
        totalSessions: 1250,
        activeUsers: 450,
        totalRequests: 5670,
        popularFeatures: [
          { feature: 'Harvest Logging', usage: 45 },
          { feature: 'Marketplace', usage: 30 },
          { feature: 'Credit Check', usage: 15 },
          { feature: 'Support', usage: 10 }
        ],
        topRegions: [
          { region: 'Kano', users: 180 },
          { region: 'Kebbi', users: 120 },
          { region: 'Benue', users: 95 },
          { region: 'Ondo', users: 55 }
        ],
        averageSessionDuration: '2.5 minutes',
        successRate: 94.5
      };

      res.status(200).json({
        status: 'success',
        message: 'USSD statistics retrieved successfully',
        data: stats
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error getting USSD stats');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error retrieving USSD statistics'
      });
    }
  }

  /**
   * Register USSD service with telecom provider
   * POST /api/ussd/register
   */
  async registerUSSDService(req: Request, res: Response): Promise<void> {
    try {
      const { provider, callbackUrl, serviceCode } = req.body;

      if (!provider || !callbackUrl) {
        res.status(400).json({
          status: 'error',
          message: 'Provider and callback URL are required'
        });
        return;
      }

      // Mock registration - in production, call telecom provider API
      const registrationResult = {
        provider,
        serviceCode: serviceCode || ussdService.getServiceCode(),
        callbackUrl,
        status: 'registered',
        registrationId: `reg_${Date.now()}`,
        message: `USSD service registered successfully with ${provider}`
      };

      logger.info({ provider, serviceCode: registrationResult.serviceCode }, 'USSD service registered');

      res.status(200).json({
        status: 'success',
        message: 'USSD service registered successfully',
        data: registrationResult
      });

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error registering USSD service');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error during USSD service registration'
      });
    }
  }

  /**
   * Handle USSD callback from telecom provider
   * POST /api/ussd/callback
   */
  async handleUSSDCallback(req: Request, res: Response): Promise<void> {
    try {
      const callbackData = req.body;
      
      logger.info({ callbackData }, 'Received USSD callback from telecom provider');

      // Process callback data
      const ussdRequest = {
        sessionId: callbackData.sessionId,
        phoneNumber: callbackData.phoneNumber,
        serviceCode: callbackData.serviceCode,
        text: callbackData.text || '',
        networkCode: callbackData.networkCode
      };

      // Process USSD request
      const ussdResponse = await ussdService.processUSSDRequest(ussdRequest);

      // Send response back to telecom provider
      const responseSent = await ussdService.sendUSSDResponse(ussdResponse);

      if (responseSent) {
        res.status(200).json({
          status: 'success',
          message: 'USSD callback processed successfully',
          data: ussdResponse
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to send USSD response to telecom provider'
        });
      }

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error handling USSD callback');
      res.status(500).json({
        status: 'error',
        message: 'Internal server error processing USSD callback'
      });
    }
  }
}

export default new USSDController();

