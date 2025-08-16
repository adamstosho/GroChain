import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CropAnalysis } from '../models/cropAnalysis.model';
import { ImageRecognitionService } from '../services/imageRecognition.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class ImageRecognitionController {
  // Analyze crop image
  static async analyzeCropImage(req: AuthRequest, res: Response) {
    try {
      const schema = Joi.object({
        imageUrl: Joi.string().uri().required(),
        cropType: Joi.string().required(),
        analysisType: Joi.string().valid('disease', 'quality', 'growth', 'nutrient', 'pest').required(),
        fieldId: Joi.string().optional(),
        location: Joi.object({
          latitude: Joi.number().min(-90).max(90).required(),
          longitude: Joi.number().min(-180).max(180).required()
        }).optional(),
        weather: Joi.object({
          temperature: Joi.number().optional(),
          humidity: Joi.number().optional(),
          rainfall: Joi.number().optional()
        }).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const farmerId = (req.user as any).id;
      const startTime = Date.now();

      // Perform image analysis
      const analysisResult = await ImageRecognitionService.analyzeCropImage(
        value.imageUrl,
        value.cropType,
        value.analysisType
      );

      const processingTime = Date.now() - startTime;

      // Create crop analysis record
      const cropAnalysis = new CropAnalysis({
        imageUrl: value.imageUrl,
        farmer: farmerId,
        fieldId: value.fieldId,
        cropType: value.cropType,
        analysisType: value.analysisType,
        confidence: this.calculateConfidence(analysisResult),
        results: this.formatResults(analysisResult, value.analysisType),
        metadata: {
          imageSize: { width: 1920, height: 1080 }, // Default size
          captureDate: new Date(),
          location: value.location || { latitude: 0, longitude: 0 },
          weather: value.weather || {},
          processingTime,
          modelVersion: '1.0.0'
        },
        recommendations: this.generateRecommendations(analysisResult, value.analysisType),
        status: 'completed'
      });

      await cropAnalysis.save();

      logger.info('Crop image analysis completed for %s: %s', value.cropType, value.analysisType);

      res.status(201).json({
        success: true,
        message: 'Crop image analysis completed successfully',
        data: {
          analysis: cropAnalysis,
          results: analysisResult
        }
      });
    } catch (error) {
      logger.error('Error analyzing crop image: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get crop analysis by ID
  static async getCropAnalysis(req: AuthRequest, res: Response) {
    try {
      const { analysisId } = req.params;
      const farmerId = (req.user as any).id;

      const analysis = await CropAnalysis.findOne({ _id: analysisId, farmer: farmerId });
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Crop analysis not found'
        });
      }

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error getting crop analysis: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all crop analyses for a farmer
  static async getFarmerAnalyses(req: AuthRequest, res: Response) {
    try {
      const farmerId = (req.user as any).id;
      const { cropType, analysisType, status, limit = 50, page = 1 } = req.query;

      const filter: any = { farmer: farmerId };
      if (cropType) filter.cropType = cropType;
      if (analysisType) filter.analysisType = analysisType;
      if (status) filter.status = status;

      const skip = (Number(page) - 1) * Number(limit);
      const analyses = await CropAnalysis.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await CropAnalysis.countDocuments(filter);

      res.json({
        success: true,
        data: analyses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error getting farmer analyses: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get analyses by crop type
  static async getAnalysesByCropType(req: AuthRequest, res: Response) {
    try {
      const { cropType } = req.params;
      const farmerId = (req.user as any).id;

      const analyses = await CropAnalysis.find({ farmer: farmerId, cropType })
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({
        success: true,
        data: analyses,
        count: analyses.length
      });
    } catch (error) {
      logger.error('Error getting analyses by crop type: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get high-risk analyses
  static async getHighRiskAnalyses(req: AuthRequest, res: Response) {
    try {
      const farmerId = (req.user as any).id;

            const highRiskAnalyses = await CropAnalysis.find({
        $or: [
          { 'results.detectedIssues.severity': { $in: ['high', 'critical'] } },
          { 'results.cropHealth.overall': { $in: ['poor', 'critical'] } }
        ]
      }).sort({ createdAt: -1 });
      
      const farmerHighRisk = highRiskAnalyses.filter((analysis: any) =>
        analysis.farmer.toString() === farmerId
      );

      res.json({
        success: true,
        data: farmerHighRisk,
        count: farmerHighRisk.length
      });
    } catch (error) {
      logger.error('Error getting high-risk analyses: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update analysis status
  static async updateAnalysisStatus(req: Request, res: Response) {
    try {
      const { analysisId } = req.params;
      const { status } = req.body;

      const schema = Joi.object({
        status: Joi.string().valid('pending', 'processing', 'completed', 'failed').required()
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const analysis = await CropAnalysis.findById(analysisId);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Crop analysis not found'
        });
      }

      analysis.status = status;
      await analysis.save();

      logger.info('Crop analysis status updated: %s to %s', analysisId, status);

      res.json({
        success: true,
        message: 'Analysis status updated successfully',
        data: analysis
      });
    } catch (error) {
      logger.error('Error updating analysis status: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Add recommendation to analysis
  static async addRecommendation(req: Request, res: Response) {
    try {
      const { analysisId } = req.params;
      const { action, priority, description, estimatedCost, estimatedTime, effectiveness } = req.body;

      const schema = Joi.object({
        action: Joi.string().required(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').required(),
        description: Joi.string().required(),
        estimatedCost: Joi.number().min(0).required(),
        estimatedTime: Joi.number().min(0).required(),
        effectiveness: Joi.number().min(0).max(100).required()
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const analysis = await CropAnalysis.findById(analysisId);
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Crop analysis not found'
        });
      }

      analysis.recommendations.push({
        action,
        priority,
        description,
        estimatedCost,
        estimatedTime,
        effectiveness
      });
      
      await analysis.save();

      logger.info('Recommendation added to analysis: %s', analysisId);

      res.json({
        success: true,
        message: 'Recommendation added successfully',
        data: analysis
      });
    } catch (error) {
      logger.error('Error adding recommendation: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete crop analysis
  static async deleteCropAnalysis(req: AuthRequest, res: Response) {
    try {
      const { analysisId } = req.params;
      const farmerId = (req.user as any).id;

      const analysis = await CropAnalysis.findOne({ _id: analysisId, farmer: farmerId });
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Crop analysis not found'
        });
      }

      await CropAnalysis.findByIdAndDelete(analysisId);

      logger.info('Crop analysis deleted: %s', analysisId);

      res.json({
        success: true,
        message: 'Crop analysis deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting crop analysis: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Helper methods
  private static calculateConfidence(analysisResult: any): number {
    if (Array.isArray(analysisResult)) {
      // For disease/pest detection arrays
      if (analysisResult.length === 0) return 95; // No issues detected
      return Math.round(analysisResult.reduce((sum, item) => sum + item.confidence, 0) / analysisResult.length);
    } else if (analysisResult.confidence) {
      // For quality assessment
      return analysisResult.confidence;
    } else if (analysisResult.score) {
      // For growth stage analysis
      return Math.round(analysisResult.score);
    }
    return 85; // Default confidence
  }

  private static formatResults(analysisResult: any, analysisType: string): any {
    switch (analysisType) {
      case 'disease':
        return {
          detectedIssues: analysisResult.map((disease: any) => ({
            issue: disease.disease,
            confidence: disease.confidence,
            severity: disease.severity,
            description: disease.description,
            recommendations: disease.treatment
          })),
          cropHealth: {
            overall: analysisResult.length > 0 ? 'poor' : 'excellent',
            score: analysisResult.length > 0 ? 60 : 95,
            factors: []
          },
          growthStage: {
            current: 'Unknown',
            estimatedDaysToHarvest: 0,
            progress: 0
          },
          qualityMetrics: {
            color: 'Unknown',
            texture: 'Unknown',
            size: 'Unknown',
            uniformity: 0
          }
        };

      case 'quality':
        return {
          detectedIssues: [],
          cropHealth: {
            overall: analysisResult.overall,
            score: analysisResult.score,
            factors: Object.entries(analysisResult.factors).map(([key, value]: [string, any]) => ({
              factor: key,
              status: value.status,
              value: value.value
            }))
          },
          growthStage: {
            current: 'Unknown',
            estimatedDaysToHarvest: 0,
            progress: 0
          },
          qualityMetrics: {
            color: analysisResult.factors.color.value,
            texture: analysisResult.factors.texture.value,
            size: analysisResult.factors.size.value,
            uniformity: analysisResult.factors.uniformity.score
          }
        };

      case 'growth':
        return {
          detectedIssues: [],
          cropHealth: {
            overall: 'good',
            score: 80,
            factors: []
          },
          growthStage: {
            current: analysisResult.currentStage,
            estimatedDaysToHarvest: analysisResult.estimatedDaysToHarvest,
            progress: analysisResult.progress
          },
          qualityMetrics: {
            color: 'Unknown',
            texture: 'Unknown',
            size: 'Unknown',
            uniformity: 0
          }
        };

      case 'nutrient':
        return {
          detectedIssues: [],
          cropHealth: {
            overall: 'good',
            score: 75,
            factors: []
          },
          growthStage: {
            current: 'Unknown',
            estimatedDaysToHarvest: 0,
            progress: 0
          },
          qualityMetrics: {
            color: 'Unknown',
            texture: 'Unknown',
            size: 'Unknown',
            uniformity: 0
          }
        };

      case 'pest':
        return {
          detectedIssues: analysisResult.map((pest: any) => ({
            issue: pest.pest,
            confidence: pest.confidence,
            severity: pest.severity,
            description: pest.description,
            recommendations: pest.controlMethods
          })),
          cropHealth: {
            overall: analysisResult.length > 0 ? 'poor' : 'excellent',
            score: analysisResult.length > 0 ? 65 : 90,
            factors: []
          },
          growthStage: {
            current: 'Unknown',
            estimatedDaysToHarvest: 0,
            progress: 0
          },
          qualityMetrics: {
            color: 'Unknown',
            texture: 'Unknown',
            size: 'Unknown',
            uniformity: 0
          }
        };

      default:
        return {
          detectedIssues: [],
          cropHealth: { overall: 'good', score: 80, factors: [] },
          growthStage: { current: 'Unknown', estimatedDaysToHarvest: 0, progress: 0 },
          qualityMetrics: { color: 'Unknown', texture: 'Unknown', size: 'Unknown', uniformity: 0 }
        };
    }
  }

  private static generateRecommendations(analysisResult: any, analysisType: string): any[] {
    const recommendations: any[] = [];

    switch (analysisType) {
      case 'disease':
        if (analysisResult.length > 0) {
          analysisResult.forEach((disease: any) => {
            recommendations.push({
              action: `Treat ${disease.disease}`,
              priority: disease.severity === 'critical' ? 'urgent' : 'high',
              description: `Apply recommended treatment for ${disease.disease}`,
              estimatedCost: 50,
              estimatedTime: 2,
              effectiveness: 85
            });
          });
        }
        break;

      case 'quality':
        if (analysisResult.score < 80) {
          recommendations.push({
            action: 'Improve crop quality',
            priority: analysisResult.score < 60 ? 'urgent' : 'high',
            description: 'Implement quality improvement measures',
            estimatedCost: 100,
            estimatedTime: 7,
            effectiveness: 75
          });
        }
        break;

      case 'growth':
        if (analysisResult.progress < 50) {
          recommendations.push({
            action: 'Optimize growth conditions',
            priority: 'medium',
            description: 'Ensure optimal growing conditions for better progress',
            estimatedCost: 75,
            estimatedTime: 3,
            effectiveness: 80
          });
        }
        break;

      case 'nutrient':
        if (analysisResult.nitrogen.status === 'deficient' || 
            analysisResult.phosphorus.status === 'deficient' || 
            analysisResult.potassium.status === 'deficient') {
          recommendations.push({
            action: 'Apply fertilizer',
            priority: 'high',
            description: 'Address nutrient deficiencies',
            estimatedCost: 60,
            estimatedTime: 1,
            effectiveness: 90
          });
        }
        break;

      case 'pest':
        if (analysisResult.length > 0) {
          analysisResult.forEach((pest: any) => {
            recommendations.push({
              action: `Control ${pest.pest}`,
              priority: pest.severity === 'critical' ? 'urgent' : 'high',
              description: `Implement pest control measures for ${pest.pest}`,
              estimatedCost: 80,
              estimatedTime: 3,
              effectiveness: 80
            });
          });
        }
        break;
    }

    return recommendations;
  }
}
