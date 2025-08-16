import { Request, Response } from 'express';
import { AIRecommendationService } from '../services/aiRecommendation.service';
import { PredictiveAnalyticsService } from '../services/predictiveAnalytics.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class AIController {
  // Get AI-powered crop recommendations
  static async getCropRecommendations(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        location: Joi.string().required().min(3).max(100),
        season: Joi.string().valid('rainy', 'dry', 'all-year').required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details
        });
      }

      const { location, season } = value;
      const userId = (req as any).user.id;

      const recommendations = await AIRecommendationService.getCropRecommendations(
        userId,
        location,
        season
      );

      return res.status(200).json({
        status: 'success',
        data: {
          recommendations,
          location,
          season,
          totalRecommendations: recommendations.length
        }
      });
    } catch (error) {
      logger.error('Crop recommendations error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get crop recommendations'
      });
    }
  }

  // Get yield prediction for specific crop
  static async getYieldPrediction(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        cropName: Joi.string().required().min(2).max(50),
        location: Joi.string().required().min(3).max(100),
        season: Joi.string().valid('rainy', 'dry', 'all-year').required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details
        });
      }

      const { cropName, location, season } = value;
      const userId = (req as any).user.id;

      const prediction = await AIRecommendationService.predictYield(
        userId,
        cropName,
        location,
        season
      );

      return res.status(200).json({
        status: 'success',
        data: prediction
      });
    } catch (error) {
      logger.error('Yield prediction error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get yield prediction'
      });
    }
  }

  // Get market insights for specific crop
  static async getMarketInsights(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        cropName: Joi.string().required().min(2).max(50)
      }).validate(req.query);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details
        });
      }

      const { cropName } = value;

      const insights = await AIRecommendationService.getMarketInsights(cropName);

      return res.status(200).json({
        status: 'success',
        data: insights
      });
    } catch (error) {
      logger.error('Market insights error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get market insights'
      });
    }
  }

  // Get comprehensive farming insights for user
  static async getFarmingInsights(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const insights = await AIRecommendationService.getFarmingInsights(userId);

      return res.status(200).json({
        status: 'success',
        data: insights
      });
    } catch (error) {
      logger.error('Farming insights error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get farming insights'
      });
    }
  }

  // Get AI-powered farming recommendations
  static async getFarmingRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Get all insights and create comprehensive recommendations
      const insights = await AIRecommendationService.getFarmingInsights(userId);
      
      // Get user's location (you might want to store this in user profile)
      const user = (req as any).user;
      const location = user.location || 'Nigeria';
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 3 && currentMonth <= 10 ? 'rainy' : 'dry';

      // Get crop recommendations
      const cropRecommendations = await AIRecommendationService.getCropRecommendations(
        userId,
        location,
        season
      );

      // Create personalized recommendations
      const recommendations: {
        immediateActions: string[];
        shortTermGoals: string[];
        longTermStrategy: string[];
        riskMitigation: string[];
        marketOpportunities: string[];
      } = {
        immediateActions: [],
        shortTermGoals: [],
        longTermStrategy: [],
        riskMitigation: [],
        marketOpportunities: []
      };

      // Immediate actions based on current performance
      if (insights.averageYield < 100) {
        recommendations.immediateActions.push('Focus on soil improvement and pest control');
        recommendations.immediateActions.push('Consider crop rotation and intercropping');
      }

      if (insights.totalRevenue < 50000) {
        recommendations.immediateActions.push('Focus on high-value crops and market timing');
        recommendations.immediateActions.push('Build relationships with buyers and processors');
      }

      // Short term goals
      if (cropRecommendations.length > 0) {
        const topCrop = cropRecommendations[0];
        recommendations.shortTermGoals.push(`Plant ${topCrop.crop} in the upcoming ${topCrop.plantingSeason} season`);
        recommendations.shortTermGoals.push(`Target yield of ${topCrop.expectedYield}kg with estimated revenue of ₦${topCrop.estimatedRevenue.toLocaleString()}`);
      }

      // Long term strategy
      if (insights.topPerformingCrops.length > 0) {
        recommendations.longTermStrategy.push('Expand production of top-performing crops');
        recommendations.longTermStrategy.push('Diversify into complementary crops for year-round income');
      }

      // Risk mitigation
      if (season === 'dry') {
        recommendations.riskMitigation.push('Prepare irrigation systems for dry season farming');
        recommendations.riskMitigation.push('Focus on drought-resistant crops');
      }

      // Market opportunities
      if (insights.marketOpportunities.length > 0) {
        recommendations.marketOpportunities.push('Explore high-demand crops with rising prices');
        recommendations.marketOpportunities.push('Consider expanding into export markets');
      }

      return res.status(200).json({
        status: 'success',
        data: {
          recommendations,
          insights: {
            currentSeason: season,
            location,
            performance: {
              totalHarvests: insights.totalHarvests,
              totalRevenue: insights.totalRevenue,
              averageYield: insights.averageYield
            }
          }
        }
      });
    } catch (error) {
      logger.error('Farming recommendations error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get farming recommendations'
      });
    }
  }

  // Get AI analytics dashboard data
  static async getAnalyticsDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { period = 'month' } = req.query;

      // Get comprehensive data for dashboard
      const insights = await AIRecommendationService.getFarmingInsights(userId);
      
      // Get user's location and season
      const user = (req as any).user;
      const location = user.location || 'Nigeria';
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 3 && currentMonth <= 10 ? 'rainy' : 'dry';

      // Get crop recommendations for current season
      const cropRecommendations = await AIRecommendationService.getCropRecommendations(
        userId,
        location,
        season
      );

      // Calculate performance metrics
      const performanceMetrics = {
        yieldEfficiency: insights.averageYield > 200 ? 'high' : insights.averageYield > 100 ? 'medium' : 'low',
        revenueGrowth: insights.totalRevenue > 100000 ? 'high' : insights.totalRevenue > 50000 ? 'medium' : 'low',
        cropDiversity: insights.topPerformingCrops.length > 3 ? 'high' : insights.topPerformingCrops.length > 1 ? 'medium' : 'low',
        marketAdaptation: insights.marketOpportunities.length > 2 ? 'high' : 'medium'
      };

      // Create dashboard data
      const dashboard = {
        overview: {
          totalHarvests: insights.totalHarvests,
          totalRevenue: insights.totalRevenue,
          averageYield: insights.averageYield,
          currentSeason: season,
          location
        },
        performance: performanceMetrics,
        recommendations: cropRecommendations.slice(0, 5),
        trends: insights.seasonalTrends,
        opportunities: insights.marketOpportunities.slice(0, 3),
        topCrops: insights.topPerformingCrops.slice(0, 5),
        improvements: insights.improvementAreas.slice(0, 3)
      };

      return res.status(200).json({
        status: 'success',
        data: dashboard
      });
    } catch (error) {
      logger.error('Analytics dashboard error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get analytics dashboard'
      });
    }
  }

  // Get seasonal farming calendar
  static async getSeasonalCalendar(req: Request, res: Response) {
    try {
      const { location = 'Nigeria' } = req.query;
      const userId = (req as any).user.id;

      // Get recommendations for both seasons
      const rainySeasonRecommendations = await AIRecommendationService.getCropRecommendations(
        userId,
        location as string,
        'rainy'
      );

      const drySeasonRecommendations = await AIRecommendationService.getCropRecommendations(
        userId,
        location as string,
        'dry'
      );

      const calendar = {
        rainySeason: {
          months: 'March - October',
          description: 'Optimal growing conditions with natural rainfall',
          topCrops: rainySeasonRecommendations.slice(0, 5),
          activities: [
            'Plant major crops (Yam, Maize, Rice, Beans)',
            'Focus on soil moisture management',
            'Monitor for pests and diseases',
            'Prepare for harvest season'
          ]
        },
        drySeason: {
          months: 'November - February',
          description: 'Requires irrigation and drought-resistant crops',
          topCrops: drySeasonRecommendations.slice(0, 5),
          activities: [
            'Plant drought-resistant crops (Tomatoes, Pepper)',
            'Implement irrigation systems',
            'Focus on high-value crops',
            'Prepare land for next rainy season'
          ]
        },
        yearRound: {
          description: 'Crops that can be grown throughout the year',
          crops: ['Cassava', 'Cocoa', 'Palm Oil'],
          activities: [
            'Continuous production planning',
            'Market timing optimization',
            'Quality maintenance'
          ]
        }
      };

      return res.status(200).json({
        status: 'success',
        data: calendar
      });
    } catch (error) {
      logger.error('Seasonal calendar error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get seasonal calendar'
      });
    }
  }

  // Get weather prediction for location
  static async getWeatherPrediction(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        location: Joi.string().required().min(3).max(100),
        month: Joi.number().integer().min(1).max(12).default(new Date().getMonth() + 1)
      }).validate(req.query);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details
        });
      }

      const { location, month } = value;

      const prediction = await PredictiveAnalyticsService.predictWeather(location, month);

      return res.status(200).json({
        status: 'success',
        data: prediction
      });
    } catch (error) {
      logger.error('Weather prediction error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get weather prediction'
      });
    }
  }

  // Get market trend analysis
  static async getMarketTrendAnalysis(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        cropName: Joi.string().required().min(2).max(50)
      }).validate(req.query);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details
        });
      }

      const { cropName } = value;

      const analysis = await PredictiveAnalyticsService.analyzeMarketTrends(cropName);

      return res.status(200).json({
        status: 'success',
        data: analysis
      });
    } catch (error) {
      logger.error('Market trend analysis error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get market trend analysis'
      });
    }
  }

  // Get risk assessment
  static async getRiskAssessment(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        cropName: Joi.string().required().min(2).max(50),
        location: Joi.string().required().min(3).max(100),
        season: Joi.string().valid('rainy', 'dry', 'all-year').required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details
        });
      }

      const { cropName, location, season } = value;

      const assessment = await PredictiveAnalyticsService.assessRisk(cropName, location, season);

      return res.status(200).json({
        status: 'success',
        data: assessment
      });
    } catch (error) {
      logger.error('Risk assessment error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get risk assessment'
      });
    }
  }

  // Get comprehensive predictive insights
  static async getPredictiveInsights(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        cropName: Joi.string().required().min(2).max(50),
        location: Joi.string().required().min(3).max(100),
        month: Joi.number().integer().min(1).max(12).default(new Date().getMonth() + 1)
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details
        });
      }

      const { cropName, location, month } = value;

      const insights = await PredictiveAnalyticsService.getPredictiveInsights(cropName, location, month);

      return res.status(200).json({
        status: 'success',
        data: insights
      });
    } catch (error) {
      logger.error('Predictive insights error: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get predictive insights'
      });
    }
  }
}
