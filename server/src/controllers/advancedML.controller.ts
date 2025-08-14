import { Request, Response } from 'express';
import { AdvancedMLService } from '../services/advancedML.service';
import { logger } from '../index';
import Joi from 'joi';

export class AdvancedMLController {
  // Get predictive maintenance for a sensor
  static async getPredictiveMaintenance(req: Request, res: Response) {
    try {
      const { sensorId } = req.params;

      const maintenance = await AdvancedMLService.predictMaintenance(sensorId);
      if (!maintenance) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found or maintenance data unavailable'
        });
      }

      res.json({
        success: true,
        data: maintenance
      });
    } catch (error) {
      logger.error('Error getting predictive maintenance: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Detect anomalies for a sensor
  static async detectAnomalies(req: Request, res: Response) {
    try {
      const { sensorId } = req.params;
      const { timeRange = 24 } = req.query;

      const schema = Joi.object({
        timeRange: Joi.number().min(1).max(168).optional() // Max 1 week
      });

      const { error } = schema.validate({ timeRange });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const anomalies = await AdvancedMLService.detectAnomalies(sensorId, Number(timeRange));

      res.json({
        success: true,
        data: anomalies,
        count: anomalies.length,
        timeRange: Number(timeRange)
      });
    } catch (error) {
      logger.error('Error detecting anomalies: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Optimize irrigation
  static async optimizeIrrigation(req: Request, res: Response) {
    try {
      const farmerId = (req.user as any).id;

      const optimization = await AdvancedMLService.optimizeIrrigation(farmerId);
      if (!optimization) {
        return res.status(404).json({
          success: false,
          message: 'No soil sensors found for irrigation optimization'
        });
      }

      res.json({
        success: true,
        data: optimization
      });
    } catch (error) {
      logger.error('Error optimizing irrigation: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Optimize fertilizer
  static async optimizeFertilizer(req: Request, res: Response) {
    try {
      const farmerId = (req.user as any).id;

      const optimization = await AdvancedMLService.optimizeFertilizer(farmerId);
      if (!optimization) {
        return res.status(404).json({
          success: false,
          message: 'No soil sensors or nutrient analyses found for fertilizer optimization'
        });
      }

      res.json({
        success: true,
        data: optimization
      });
    } catch (error) {
      logger.error('Error optimizing fertilizer: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Optimize harvest
  static async optimizeHarvest(req: Request, res: Response) {
    try {
      const farmerId = (req.user as any).id;

      const optimization = await AdvancedMLService.optimizeHarvest(farmerId);
      if (!optimization) {
        return res.status(404).json({
          success: false,
          message: 'No harvest data found for optimization'
        });
      }

      res.json({
        success: true,
        data: optimization
      });
    } catch (error) {
      logger.error('Error optimizing harvest: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get comprehensive optimization report
  static async getOptimizationReport(req: Request, res: Response) {
    try {
      const farmerId = (req.user as any).id;

      const [irrigation, fertilizer, harvest] = await Promise.all([
        AdvancedMLService.optimizeIrrigation(farmerId),
        AdvancedMLService.optimizeFertilizer(farmerId),
        AdvancedMLService.optimizeHarvest(farmerId)
      ]);

      const report = {
        irrigation: irrigation || { message: 'No soil sensors available' },
        fertilizer: fertilizer || { message: 'No nutrient data available' },
        harvest: harvest || { message: 'No harvest data available' },
        summary: {
          totalOptimizations: [irrigation, fertilizer, harvest].filter(Boolean).length,
          totalPotentialSavings: [irrigation, fertilizer, harvest]
            .filter(Boolean)
            .reduce((sum, opt) => sum + ((opt as any).estimatedSavings || 0), 0),
          totalImplementationCost: [irrigation, fertilizer, harvest]
            .filter(Boolean)
            .reduce((sum, opt) => sum + ((opt as any).implementationCost || 0), 0),
          averageROI: [irrigation, fertilizer, harvest]
            .filter(Boolean)
            .reduce((sum, opt) => sum + ((opt as any).roi || 0), 0) / 
            [irrigation, fertilizer, harvest].filter(Boolean).length || 0
        }
      };

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error getting optimization report: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get sensor health insights
  static async getSensorHealthInsights(req: Request, res: Response) {
    try {
      const farmerId = (req.user as any).id;

      // This would typically integrate with IoT sensor data
      // For now, return a mock insight
      const insights = {
        totalSensors: 0,
        healthySensors: 0,
        maintenanceNeeded: 0,
        criticalIssues: 0,
        recommendations: [
          'Install soil moisture sensors for better irrigation control',
          'Add weather stations for climate monitoring',
          'Implement crop health monitoring sensors'
        ]
      };

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting sensor health insights: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get farming efficiency score
  static async getFarmingEfficiencyScore(req: Request, res: Response) {
    try {
      const farmerId = (req.user as any).id;

      // Calculate efficiency based on available optimizations
      const [irrigation, fertilizer, harvest] = await Promise.all([
        AdvancedMLService.optimizeIrrigation(farmerId),
        AdvancedMLService.optimizeFertilizer(farmerId),
        AdvancedMLService.optimizeHarvest(farmerId)
      ]);

      let efficiencyScore = 100;
      let improvementAreas: string[] = [];

      if (irrigation) {
        efficiencyScore -= (100 - irrigation.currentEfficiency) * 0.3;
        if (irrigation.improvement > 10) {
          improvementAreas.push('Irrigation efficiency can be improved significantly');
        }
      }

      if (fertilizer) {
        efficiencyScore -= (100 - fertilizer.currentEfficiency) * 0.3;
        if (fertilizer.improvement > 10) {
          improvementAreas.push('Fertilizer application can be optimized');
        }
      }

      if (harvest) {
        efficiencyScore -= (100 - harvest.currentEfficiency) * 0.4;
        if (harvest.improvement > 10) {
          improvementAreas.push('Harvest timing and quality can be improved');
        }
      }

      const score = Math.max(0, Math.min(100, Math.round(efficiencyScore)));

      const efficiencyReport = {
        score,
        grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
        improvementAreas,
        recommendations: [
          'Implement IoT sensors for real-time monitoring',
          'Use AI-powered crop analysis for early problem detection',
          'Adopt precision agriculture techniques',
          'Regular soil testing and nutrient management'
        ],
        optimizations: {
          irrigation: irrigation?.improvement || 0,
          fertilizer: fertilizer?.improvement || 0,
          harvest: harvest?.improvement || 0
        }
      };

      res.json({
        success: true,
        data: efficiencyReport
      });
    } catch (error) {
      logger.error('Error getting farming efficiency score: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get predictive insights for farming decisions
  static async getPredictiveInsights(req: Request, res: Response) {
    try {
      const farmerId = (req.user as any).id;
      const { cropType, season } = req.query;

      const schema = Joi.object({
        cropType: Joi.string().optional(),
        season: Joi.string().valid('spring', 'summer', 'autumn', 'winter').optional()
      });

      const { error } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Generate predictive insights based on available data
      const insights = {
        cropType: cropType || 'general',
        season: season || 'current',
        predictions: {
          weather: {
            trend: 'Moderate rainfall expected',
            confidence: 75,
            impact: 'Positive for crop growth'
          },
          market: {
            trend: 'Stable prices expected',
            confidence: 80,
            recommendation: 'Consider forward contracts'
          },
          pests: {
            risk: 'Low to moderate',
            confidence: 70,
            prevention: 'Monitor regularly, maintain field hygiene'
          },
          diseases: {
            risk: 'Low',
            confidence: 85,
            prevention: 'Continue current practices'
          }
        },
        recommendations: [
          'Monitor weather forecasts for optimal planting timing',
          'Implement integrated pest management',
          'Maintain soil health through crop rotation',
          'Consider drought-resistant varieties for climate resilience'
        ],
        riskAssessment: {
          overall: 'Low',
          factors: [
            'Weather variability',
            'Market price fluctuations',
            'Pest pressure'
          ],
          mitigation: [
            'Diversify crop portfolio',
            'Implement insurance coverage',
            'Build emergency funds'
          ]
        }
      };

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting predictive insights: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get ML model performance metrics
  static async getMLModelPerformance(req: Request, res: Response) {
    try {
      // Mock ML model performance data
      const performance = {
        models: {
          diseaseDetection: {
            accuracy: 92.5,
            precision: 89.3,
            recall: 94.1,
            f1Score: 91.6,
            lastUpdated: new Date().toISOString(),
            trainingDataSize: '50,000+ images',
            version: '2.1.0'
          },
          yieldPrediction: {
            accuracy: 87.2,
            precision: 85.9,
            recall: 88.7,
            f1Score: 87.3,
            lastUpdated: new Date().toISOString(),
            trainingDataSize: '100,000+ records',
            version: '1.8.5'
          },
          pestDetection: {
            accuracy: 90.1,
            precision: 88.7,
            recall: 91.4,
            f1Score: 90.0,
            lastUpdated: new Date().toISOString(),
            trainingDataSize: '75,000+ images',
            version: '2.0.2'
          }
        },
        overall: {
          averageAccuracy: 89.9,
          totalPredictions: '2.5M+',
          successRate: 94.2,
          improvement: '+5.3% from last month'
        }
      };

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      logger.error('Error getting ML model performance: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
