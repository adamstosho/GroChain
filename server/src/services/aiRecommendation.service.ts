import { User } from '../models/user.model';
import { Harvest } from '../models/harvest.model';
import { Listing } from '../models/listing.model';
import { Order } from '../models/order.model';
import { logger } from '../index';

export interface CropRecommendation {
  crop: string;
  confidence: number;
  reasons: string[];
  expectedYield: number;
  marketDemand: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
  plantingSeason: string;
  estimatedRevenue: number;
}

export interface YieldPrediction {
  crop: string;
  predictedYield: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface MarketInsight {
  crop: string;
  currentPrice: number;
  priceTrend: 'rising' | 'falling' | 'stable';
  demandLevel: 'high' | 'medium' | 'low';
  bestSellingTime: string;
  competitors: number;
}

export class AIRecommendationService {
  // Crop recommendation based on location, season, and market data
  static async getCropRecommendations(
    userId: string,
    location: string,
    season: string
  ): Promise<CropRecommendation[]> {
    try {
      // Get user's farming history
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get historical harvest data
      const harvests = await Harvest.find({ farmerId: userId }).limit(100);
      
      // Get market data for crops
      const listings = await Listing.find({}).limit(50);
      
      // Simple AI algorithm: Weighted scoring based on multiple factors
      const recommendations: CropRecommendation[] = [];
      
      // Popular crops in Nigeria with high success rates
      const popularCrops = [
        { name: 'Cassava', baseScore: 85, season: 'all-year', market: 'high' },
        { name: 'Yam', baseScore: 80, season: 'rainy', market: 'high' },
        { name: 'Maize', baseScore: 75, season: 'rainy', market: 'medium' },
        { name: 'Rice', baseScore: 70, season: 'rainy', market: 'high' },
        { name: 'Beans', baseScore: 65, season: 'rainy', market: 'medium' },
        { name: 'Tomatoes', baseScore: 60, season: 'dry', market: 'high' },
        { name: 'Pepper', baseScore: 55, season: 'dry', market: 'medium' },
        { name: 'Cocoa', baseScore: 90, season: 'all-year', market: 'high' },
        { name: 'Palm Oil', baseScore: 85, season: 'all-year', market: 'high' }
      ];

      for (const crop of popularCrops) {
        let score = crop.baseScore;
        const reasons: string[] = [];
        
        // Season adjustment
        if (crop.season === season || crop.season === 'all-year') {
          score += 10;
          reasons.push('Optimal planting season');
        } else if (crop.season === 'rainy' && season === 'dry') {
          score -= 15;
          reasons.push('Not ideal season - requires irrigation');
        }

        // Market demand adjustment
        if (crop.market === 'high') {
          score += 15;
          reasons.push('High market demand');
        }

        // Historical success adjustment
        const userHarvests = harvests.filter(h => 
          h.cropType.toLowerCase().includes(crop.name.toLowerCase())
        );
        if (userHarvests.length > 0) {
          const avgYield = userHarvests.reduce((sum, h) => sum + h.quantity, 0) / userHarvests.length;
          if (avgYield > 100) {
            score += 20;
            reasons.push('Proven success on your farm');
          }
        }

        // Location-based adjustments
        if (location.toLowerCase().includes('south')) {
          if (['Cocoa', 'Palm Oil', 'Cassava'].includes(crop.name)) {
            score += 15;
            reasons.push('Ideal for southern climate');
          }
        } else if (location.toLowerCase().includes('north')) {
          if (['Yam', 'Maize', 'Beans'].includes(crop.name)) {
            score += 15;
            reasons.push('Ideal for northern climate');
          }
        }

        // Calculate expected yield (kg per hectare)
        const expectedYield = this.calculateExpectedYield(crop.name, location, season);
        
        // Calculate estimated revenue
        const marketPrice = this.getMarketPrice(crop.name);
        const estimatedRevenue = expectedYield * marketPrice;

        recommendations.push({
          crop: crop.name,
          confidence: Math.min(score, 95),
          reasons,
          expectedYield,
          marketDemand: crop.market as 'high' | 'medium' | 'low',
          riskLevel: score > 80 ? 'low' : score > 60 ? 'medium' : 'high',
          plantingSeason: crop.season,
          estimatedRevenue
        });
      }

      // Sort by confidence score
      return recommendations.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('AI recommendation error: %s', (error as Error).message);
      throw error;
    }
  }

  // Yield prediction based on historical data and current conditions
  static async predictYield(
    userId: string,
    cropName: string,
    location: string,
    season: string
  ): Promise<YieldPrediction> {
    try {
      // Get historical yield data for this crop
      const harvests = await Harvest.find({
        farmerId: userId,
        cropName: { $regex: cropName, $options: 'i' }
      }).sort({ createdAt: -1 }).limit(20);

      let predictedYield = 0;
      let confidence = 0;
      const factors: string[] = [];
      const recommendations: string[] = [];

      if (harvests.length > 0) {
        // Calculate average yield from historical data
        const yields = harvests.map(h => h.quantity);
        const avgYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
        
        // Simple trend analysis
        const recentYields = yields.slice(0, 5);
        const olderYields = yields.slice(5);
        
        if (recentYields.length > 0 && olderYields.length > 0) {
          const recentAvg = recentYields.reduce((sum, y) => sum + y, 0) / recentYields.length;
          const olderAvg = olderYields.reduce((sum, y) => sum + y, 0) / olderYields.length;
          
          if (recentAvg > olderAvg) {
            predictedYield = recentAvg * 1.1; // 10% improvement
            factors.push('Improving yield trend');
            recommendations.push('Continue current farming practices');
          } else if (recentAvg < olderAvg) {
            predictedYield = recentAvg * 0.9; // 10% decline
            factors.push('Declining yield trend');
            recommendations.push('Review farming practices and soil health');
          } else {
            predictedYield = recentAvg;
            factors.push('Stable yield pattern');
            recommendations.push('Maintain current practices');
          }
        } else {
          predictedYield = avgYield;
          factors.push('Based on historical average');
        }

        confidence = Math.min(harvests.length * 5, 85); // More data = higher confidence
      } else {
        // No historical data - use regional averages
        predictedYield = this.getRegionalAverageYield(cropName, location);
        confidence = 40;
        factors.push('Based on regional averages');
        recommendations.push('Start with small plot to gather data');
      }

      // Season adjustments
      if (season === 'rainy') {
        predictedYield *= 1.2; // 20% increase in rainy season
        factors.push('Rainy season - optimal growing conditions');
      } else if (season === 'dry') {
        predictedYield *= 0.8; // 20% decrease in dry season
        factors.push('Dry season - requires irrigation');
        recommendations.push('Consider irrigation systems');
      }

      // Location adjustments
      if (location.toLowerCase().includes('south')) {
        if (['Cassava', 'Cocoa', 'Palm Oil'].includes(cropName)) {
          predictedYield *= 1.15;
          factors.push('Ideal climate for this crop');
        }
      } else if (location.toLowerCase().includes('north')) {
        if (['Yam', 'Maize', 'Beans'].includes(cropName)) {
          predictedYield *= 1.15;
          factors.push('Ideal climate for this crop');
        }
      }

      // Add farming recommendations
      if (predictedYield < 100) {
        recommendations.push('Focus on soil improvement and pest control');
        recommendations.push('Consider crop rotation and intercropping');
      } else if (predictedYield > 500) {
        recommendations.push('Excellent conditions - consider expanding production');
        recommendations.push('Focus on quality and market timing');
      }

      return {
        crop: cropName,
        predictedYield: Math.round(predictedYield),
        confidence,
        factors,
        recommendations
      };
    } catch (error) {
      logger.error('Yield prediction error: %s', (error as Error).message);
      throw error;
    }
  }

  // Market insights and price trends
  static async getMarketInsights(cropName: string): Promise<MarketInsight> {
    try {
      // Get recent listings for this crop
      const listings = await Listing.find({
        product: { $regex: cropName, $options: 'i' }
      }).sort({ createdAt: -1 }).limit(100);

      let currentPrice = 0;
      let priceTrend: 'rising' | 'falling' | 'stable' = 'stable';
      let demandLevel: 'high' | 'medium' | 'low' = 'medium';

      if (listings.length > 0) {
        // Calculate current average price
        const recentPrices = listings.slice(0, 20).map(listing => listing.price);
        currentPrice = recentPrices.reduce((sum: number, price: number) => sum + price, 0) / recentPrices.length;

        // Analyze price trend
        if (listings.length >= 10) {
          const recentAvg = listings.slice(0, 10).reduce((sum: number, listing: any) => sum + listing.price, 0) / 10;
          const olderAvg = listings.slice(10, 20).reduce((sum: number, listing: any) => sum + listing.price, 0) / 10;
          
          if (recentAvg > olderAvg * 1.1) {
            priceTrend = 'rising';
          } else if (recentAvg < olderAvg * 0.9) {
            priceTrend = 'falling';
          }
        }

        // Analyze demand level
        const recentListings = listings.slice(0, 30);
        const totalQuantity = recentListings.reduce((sum: number, listing: any) => sum + listing.quantity, 0);
        
        if (totalQuantity > 1000) {
          demandLevel = 'high';
        } else if (totalQuantity < 300) {
          demandLevel = 'low';
        }
      } else {
        // No listing data - use default market prices
        currentPrice = this.getDefaultMarketPrice(cropName);
      }

      // Determine best selling time based on crop type
      const bestSellingTime = this.getBestSellingTime(cropName);
      
      // Estimate competitors (based on product listings)
      const competitors = listings.length;

      return {
        crop: cropName,
        currentPrice: Math.round(currentPrice * 100) / 100,
        priceTrend,
        demandLevel,
        bestSellingTime,
        competitors
      };
    } catch (error) {
      logger.error('Market insight error: %s', (error as Error).message);
      throw error;
    }
  }

  // Get farming insights and recommendations
  static async getFarmingInsights(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const harvests = await Harvest.find({ farmer: userId }).sort({ createdAt: -1 }).limit(50);
      const orders = await Order.find({ buyer: userId }).sort({ createdAt: -1 }).limit(50);

      const insights = {
        totalHarvests: harvests.length,
        totalRevenue: orders.reduce((sum: number, order: any) => sum + order.total, 0),
        averageYield: harvests.length > 0 ? harvests.reduce((sum: number, h: any) => sum + h.quantity, 0) / harvests.length : 0,
        topPerformingCrops: this.getTopPerformingCrops(harvests),
        seasonalTrends: this.analyzeSeasonalTrends(harvests),
        marketOpportunities: await this.identifyMarketOpportunities(harvests),
        improvementAreas: this.identifyImprovementAreas(harvests, orders)
      };

      return insights;
    } catch (error) {
      logger.error('Farming insights error: %s', (error as Error).message);
      throw error;
    }
  }

  // Private helper methods
  private static calculateExpectedYield(cropName: string, location: string, season: string): number {
    const baseYields: Record<string, number> = {
      'Cassava': 25000, 'Yam': 15000, 'Maize': 3000, 'Rice': 4000,
      'Beans': 1500, 'Tomatoes': 25000, 'Pepper': 8000, 'Cocoa': 1000, 'Palm Oil': 3000
    };

    let expectedYield = baseYields[cropName] || 1000;
    
    // Location adjustments
    if (location.toLowerCase().includes('south')) expectedYield *= 1.2;
    if (location.toLowerCase().includes('north')) expectedYield *= 0.9;
    
    // Season adjustments
    if (season === 'rainy') expectedYield *= 1.3;
    if (season === 'dry') expectedYield *= 0.7;
    
    return Math.round(expectedYield);
  }

  private static getMarketPrice(cropName: string): number {
    const prices: Record<string, number> = {
      'Cassava': 150, 'Yam': 300, 'Maize': 200, 'Rice': 400,
      'Beans': 800, 'Tomatoes': 250, 'Pepper': 1200, 'Cocoa': 1500, 'Palm Oil': 800
    };
    return prices[cropName] || 500;
  }

  private static getRegionalAverageYield(cropName: string, location: string): number {
    const regionalYields: Record<string, Record<string, number>> = {
      'Cassava': { 'south': 30000, 'north': 20000, 'default': 25000 },
      'Yam': { 'south': 12000, 'north': 18000, 'default': 15000 },
      'Maize': { 'south': 2500, 'north': 3500, 'default': 3000 }
    };

    const cropData = regionalYields[cropName] || regionalYields['Cassava'];
    if (location.toLowerCase().includes('south')) return cropData.south;
    if (location.toLowerCase().includes('north')) return cropData.north;
    return cropData.default;
  }

  private static getDefaultMarketPrice(cropName: string): number {
    return this.getMarketPrice(cropName);
  }

  private static getBestSellingTime(cropName: string): string {
    const sellingTimes: Record<string, string> = {
      'Cassava': 'Year-round, peak in dry season',
      'Yam': 'Harvest season (Oct-Dec)',
      'Maize': 'Harvest season (Aug-Oct)',
      'Rice': 'Harvest season (Sep-Nov)',
      'Beans': 'Harvest season (Mar-May)',
      'Tomatoes': 'Dry season (Dec-Mar)',
      'Pepper': 'Year-round, peak in dry season',
      'Cocoa': 'Year-round, peak in dry season',
      'Palm Oil': 'Year-round, peak in dry season'
    };
    return sellingTimes[cropName] || 'Harvest season';
  }

  private static getTopPerformingCrops(harvests: any[]): any[] {
    const cropPerformance = harvests.reduce((acc, harvest) => {
      const crop = harvest.cropName;
      if (!acc[crop]) acc[crop] = { totalYield: 0, count: 0 };
      acc[crop].totalYield += harvest.quantity;
      acc[crop].count += 1;
      return acc;
    }, {});

    return Object.entries(cropPerformance)
      .map(([crop, data]: [string, any]) => ({
        crop,
        averageYield: Math.round(data.totalYield / data.count),
        totalHarvests: data.count
      }))
      .sort((a, b) => b.averageYield - a.averageYield)
      .slice(0, 5);
  }

  private static analyzeSeasonalTrends(harvests: any[]): any {
    const seasonalData = harvests.reduce((acc, harvest) => {
      const month = new Date(harvest.createdAt).getMonth();
      const season = month >= 3 && month <= 10 ? 'rainy' : 'dry';
      
      if (!acc[season]) acc[season] = { totalYield: 0, count: 0 };
      acc[season].totalYield += harvest.quantity;
      acc[season].count += 1;
      return acc;
    }, {});

    return Object.entries(seasonalData).map(([season, data]: [string, any]) => ({
      season,
      averageYield: Math.round(data.totalYield / data.count),
      totalHarvests: data.count
    }));
  }

  private static async identifyMarketOpportunities(harvests: any[]): Promise<any[]> {
    const cropCounts = harvests.reduce((acc, harvest) => {
      acc[harvest.cropName] = (acc[harvest.cropName] || 0) + 1;
      return acc;
    }, {});

    const opportunities = [];
          for (const [crop, count] of Object.entries(cropCounts)) {
        if ((count as number) < 3) {
          const marketInsight = await this.getMarketInsights(crop);
          if (marketInsight.demandLevel === 'high' && marketInsight.priceTrend === 'rising') {
            opportunities.push({
              crop,
              reason: 'High demand, rising prices, low production',
              marketDemand: marketInsight.demandLevel,
              priceTrend: marketInsight.priceTrend
            });
          }
        }
      }

    return opportunities.slice(0, 5);
  }

  private static identifyImprovementAreas(harvests: any[], transactions: any[]): string[] {
    const improvements: string[] = [];
    
    if (harvests.length === 0) {
      improvements.push('Start with small-scale farming to gather data');
      improvements.push('Focus on soil preparation and crop selection');
    } else {
      const avgYield = harvests.reduce((sum, h) => sum + h.quantity, 0) / harvests.length;
      if (avgYield < 100) {
        improvements.push('Improve soil fertility and pest management');
        improvements.push('Consider crop rotation and intercropping');
      }
      
      const revenue = transactions.reduce((sum, t) => sum + t.amount, 0);
      if (revenue < 50000) {
        improvements.push('Focus on high-value crops and market timing');
        improvements.push('Build relationships with buyers and processors');
      }
    }

    return improvements;
  }
}
