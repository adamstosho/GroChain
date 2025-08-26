import { Request, Response } from 'express';
import { ussdService, USSDRequest } from '../services/ussd.service';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';

// USSD request validation schema
const ussdRequestSchema = Joi.object({
  sessionId: Joi.string().required(),
  serviceCode: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  text: Joi.string().allow('').default('')
});

export const processUSSDRequest = async (req: Request, res: Response) => {
  try {
    // Validate request
    const { error, value } = ussdRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid USSD request',
        error: error.details[0].message
      });
    }

    const ussdRequest: USSDRequest = value;
    
    // Process USSD request
    const response = await ussdService.processRequest(ussdRequest);
    
    // Return response in Africastalking format
    res.json({
      sessionId: response.sessionId,
      message: response.message,
      status: response.status
    });
  } catch (error) {
    console.error('USSD controller error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

export const getUSSDStats = async (req: Request, res: Response) => {
  try {
    const stats = ussdService.getSessionStats();
    
    res.json({
      status: 'success',
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
        service: 'GroChain USSD Gateway'
      }
    });
  } catch (error) {
    console.error('USSD stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get USSD statistics',
      error: (error as Error).message
    });
  }
};

export const testUSSDConnection = async (req: Request, res: Response) => {
  try {
    // Test USSD service
    const testRequest: USSDRequest = {
      sessionId: 'test-session-' + Date.now(),
      serviceCode: '*123*1#',
      phoneNumber: '+2348000000000',
      text: ''
    };
    
    const response = await ussdService.processRequest(testRequest);
    
    res.json({
      status: 'success',
      message: 'USSD service is working correctly',
      data: {
        testRequest,
        response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('USSD test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'USSD service test failed',
      error: (error as Error).message
    });
  }
};

export const getUSSDMenus = async (req: Request, res: Response) => {
  try {
    // This would return the available USSD menus for documentation
    res.json({
      status: 'success',
      message: 'USSD menus retrieved successfully',
      data: {
        availableMenus: [
          'main',
          'harvest',
          'marketplace',
          'financial',
          'support',
          'profile'
        ],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('USSD menus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get USSD menus',
      error: (error as Error).message
    });
  }
};

