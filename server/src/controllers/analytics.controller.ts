import { Request, Response } from 'express';
import analyticsService from '../services/analytics.service';
import { logger } from '../utils/logger';
import { validateAnalyticsFilters } from '../middlewares/validation.middleware';

export class AnalyticsController {
  /**
   * Get comprehensive dashboard metrics
   * GET /api/analytics/dashboard
   */
  async getDashboardMetrics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        period: req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.query.region as string | undefined,
        partnerId: req.query.partnerId as string | undefined
      };

      // Validate filters
      const validationResult = validateAnalyticsFilters(filters);
      if (!validationResult.isValid) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid filters provided',
          errors: validationResult.errors
        });
        return;
      }

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Dashboard metrics retrieved successfully',
        data: metrics
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getDashboardMetrics');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve dashboard metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get farmer analytics
   * GET /api/analytics/farmers
   */
  async getFarmerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Farmer analytics retrieved successfully',
        data: {
          overview: {
            total: metrics.farmers.total,
            active: metrics.farmers.active,
            new: metrics.farmers.new,
            verified: metrics.farmers.verified
          },
          demographics: {
            byGender: metrics.farmers.byGender,
            byAgeGroup: metrics.farmers.byAgeGroup,
            byEducation: metrics.farmers.byEducation,
            byRegion: metrics.farmers.byRegion
          },
          trends: {
            growthRate: metrics.overview.growthRate,
            newFarmersTrend: metrics.farmers.new
          }
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getFarmerAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve farmer analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get transaction analytics
   * GET /api/analytics/transactions
   */
  async getTransactionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Transaction analytics retrieved successfully',
        data: {
          overview: {
            total: metrics.transactions.total,
            volume: metrics.transactions.volume,
            averageValue: metrics.transactions.averageValue
          },
          breakdown: {
            byStatus: metrics.transactions.byStatus,
            byPaymentMethod: metrics.transactions.byPaymentMethod
          },
          trends: metrics.transactions.trend
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getTransactionAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve transaction analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get harvest analytics
   * GET /api/analytics/harvests
   */
  async getHarvestAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Harvest analytics retrieved successfully',
        data: {
          overview: {
            total: metrics.harvests.total,
            totalVolume: metrics.harvests.totalVolume,
            averageYield: metrics.harvests.averageYield,
            postHarvestLoss: metrics.harvests.postHarvestLoss
          },
          breakdown: {
            byCrop: metrics.harvests.byCrop,
            byQuality: metrics.harvests.byQuality
          },
          trends: metrics.harvests.trend
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getHarvestAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve harvest analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get marketplace analytics
   * GET /api/analytics/marketplace
   */
  async getMarketplaceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Marketplace analytics retrieved successfully',
        data: {
          overview: {
            listings: metrics.marketplace.listings,
            orders: metrics.marketplace.orders,
            revenue: metrics.marketplace.revenue,
            commission: metrics.marketplace.commission,
            activeProducts: metrics.marketplace.activeProducts
          },
          topProducts: metrics.marketplace.topProducts
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getMarketplaceAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve marketplace analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get fintech analytics
   * GET /api/analytics/fintech
   */
  async getFintechAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Fintech analytics retrieved successfully',
        data: {
          creditScores: metrics.fintech.creditScores,
          loans: metrics.fintech.loans
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getFintechAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve fintech analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get impact analytics
   * GET /api/analytics/impact
   */
  async getImpactAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Impact analytics retrieved successfully',
        data: {
          economic: {
            incomeIncrease: metrics.impact.incomeIncrease,
            productivityImprovement: metrics.impact.productivityImprovement,
            employmentCreated: metrics.impact.employmentCreated
          },
          social: {
            foodSecurity: metrics.impact.foodSecurity
          },
          environmental: {
            carbonFootprintReduction: metrics.impact.carbonFootprintReduction,
            waterConservation: metrics.impact.waterConservation
          }
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getImpactAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve impact analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get partner analytics
   * GET /api/analytics/partners
   */
  async getPartnerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        partnerId: req.query.partnerId as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Partner analytics retrieved successfully',
        data: {
          overview: {
            total: metrics.partners.total,
            active: metrics.partners.active,
            farmerReferrals: metrics.partners.farmerReferrals,
            revenueGenerated: metrics.partners.revenueGenerated,
            performanceScore: metrics.partners.performanceScore
          },
          topPerformers: metrics.partners.topPerformers
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getPartnerAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve partner analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get weather analytics
   * GET /api/analytics/weather
   */
  async getWeatherAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Weather analytics retrieved successfully',
        data: {
          overview: {
            averageTemperature: metrics.weather.averageTemperature,
            averageHumidity: metrics.weather.averageHumidity,
            rainfall: metrics.weather.rainfall,
            droughtDays: metrics.weather.droughtDays,
            favorableDays: metrics.weather.favorableDays
          },
          impact: metrics.weather.impact
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getWeatherAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve weather analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate analytics report
   * POST /api/analytics/report
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        period: req.body.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.body.region as string | undefined,
        partnerId: req.body.partnerId as string | undefined
      };

      // Validate filters
      const validationResult = validateAnalyticsFilters(filters);
      if (!validationResult.isValid) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid filters provided',
          errors: validationResult.errors
        });
        return;
      }

      const report = await analyticsService.generateAnalyticsReport(filters);

      res.status(201).json({
        status: 'success',
        message: 'Analytics report generated successfully',
        data: {
          reportId: report._id,
          date: report.date,
          period: report.period,
          region: report.region,
          metadata: report.metadata
        }
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in generateReport:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate analytics report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get analytics reports
   * GET /api/analytics/reports
   */
  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        period: req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.query.region as string | undefined
      };

      const reports = await analyticsService.getAnalyticsData(filters);

      res.status(200).json({
        status: 'success',
        message: 'Analytics reports retrieved successfully',
        data: reports.map(report => ({
          id: report._id,
          date: report.date,
          period: report.period,
          region: report.region,
          metadata: report.metadata
        }))
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getReports:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve analytics reports',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get export data for government/NGO reporting
   * GET /api/analytics/export
   */
  async exportAnalyticsData(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        period: req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.query.region as string | undefined
      };

      const format = (req.query.format as 'json' | 'csv' | 'excel') || 'json';
      const exportData = await analyticsService.exportAnalyticsData(filters, format);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${filters.period || 'monthly'}-${filters.region || 'all'}.csv"`);
        res.status(200).send(exportData);
      } else {
        res.status(200).json({
          status: 'success',
          message: 'Analytics data exported successfully',
          data: exportData
        });
      }
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in exportAnalyticsData:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to export analytics data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get comparative analytics between two periods
   * POST /api/analytics/compare
   */
  async getComparativeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const baselineFilters = {
        startDate: req.body.baselineStartDate ? new Date(req.body.baselineStartDate) : undefined,
        endDate: req.body.baselineEndDate ? new Date(req.body.baselineEndDate) : undefined,
        period: req.body.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.body.region as string | undefined
      };

      const currentFilters = {
        startDate: req.body.currentStartDate ? new Date(req.body.currentStartDate) : undefined,
        endDate: req.body.currentEndDate ? new Date(req.body.currentEndDate) : undefined,
        period: req.body.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.body.region as string | undefined
      };

      const comparativeData = await analyticsService.getComparativeAnalytics(baselineFilters, currentFilters);

      res.status(200).json({
        status: 'success',
        message: 'Comparative analytics retrieved successfully',
        data: comparativeData
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getComparativeAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve comparative analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get regional analytics comparison
   * POST /api/analytics/regional
   */
  async getRegionalAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        period: req.body.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined
      };

      const regions = req.body.regions as string[];
      if (!regions || regions.length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Regions array is required'
        });
        return;
      }

      const regionalData = await analyticsService.getRegionalAnalytics(filters, regions);

      res.status(200).json({
        status: 'success',
        message: 'Regional analytics retrieved successfully',
        data: regionalData
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getRegionalAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve regional analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get predictive analytics for forecasting
   * GET /api/analytics/predictive
   */
  async getPredictiveAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        period: req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.query.region as string | undefined
      };

      const predictiveData = await analyticsService.getPredictiveAnalytics(filters);

      res.status(200).json({
        status: 'success',
        message: 'Predictive analytics retrieved successfully',
        data: predictiveData
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getPredictiveAnalytics:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve predictive analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get analytics summary for quick overview
   * GET /api/analytics/summary
   */
  async getAnalyticsSummary(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        period: req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | undefined,
        region: req.query.region as string | undefined
      };

      const metrics = await analyticsService.generateDashboardMetrics(filters);

      const summary = {
        keyMetrics: {
          totalFarmers: metrics.farmers.total,
          activeFarmers: metrics.farmers.active,
          totalRevenue: metrics.marketplace.revenue,
          totalTransactions: metrics.transactions.total,
          growthRate: metrics.overview.growthRate
        },
        topPerformers: {
          topProducts: metrics.marketplace.topProducts.slice(0, 5),
          topPartners: metrics.partners.topPerformers.slice(0, 5)
        },
        impact: {
          incomeIncrease: metrics.impact.incomeIncrease,
          productivityImprovement: metrics.impact.productivityImprovement,
          foodSecurity: metrics.impact.foodSecurity
        }
      };

      res.status(200).json({
        status: 'success',
        message: 'Analytics summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Error in getAnalyticsSummary:');
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve analytics summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new AnalyticsController();
