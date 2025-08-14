import { Listing } from '../models/listing.model';
import { Harvest } from '../models/harvest.model';
import { logger } from '../index';

export interface WeatherPrediction {
  season: string;
  rainfall: 'high' | 'medium' | 'low';
  temperature: 'hot' | 'warm' | 'cool';
  humidity: 'high' | 'medium' | 'low';
  farmingConditions: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
  confidence: number;
}

export interface MarketTrend {
  crop: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: 'strong_up' | 'up' | 'stable' | 'down' | 'strong_down';
  volatility: 'low' | 'medium' | 'high';
  prediction: 'price_will_rise' | 'price_will_fall' | 'price_will_stabilize';
  confidence: number;
  factors: string[];
}

export interface RiskAssessment {
  crop: string;
  overallRisk: 'low' | 'medium' | 'high';
  weatherRisk: 'low' | 'medium' | 'high';
  marketRisk: 'low' | 'medium' | 'high';
  pestRisk: 'low' | 'medium' | 'high';
  diseaseRisk: 'low' | 'medium' | 'high';
  riskFactors: string[];
  mitigationStrategies: string[];
  insuranceRecommendation: boolean;
}

export class PredictiveAnalyticsService {
  // Weather prediction based on seasonal patterns
  static async predictWeather(location: string, month: number): Promise<WeatherPrediction> {
    try {
      // Simple weather prediction based on Nigerian seasonal patterns
      const season = month >= 3 && month <= 10 ? 'rainy' : 'dry';
      
      let rainfall: 'high' | 'medium' | 'low';
      let temperature: 'hot' | 'warm' | 'cool';
      let humidity: 'high' | 'medium' | 'low';
      let farmingConditions: 'excellent' | 'good' | 'fair' | 'poor';
      const recommendations: string[] = [];
      
      if (season === 'rainy') {
        rainfall = 'high';
        temperature = month >= 6 && month <= 8 ? 'warm' : 'hot';
        humidity = 'high';
        
        if (month >= 4 && month <= 7) {
          farmingConditions = 'excellent';
          recommendations.push('Optimal planting conditions');
          recommendations.push('Focus on major crops (Yam, Maize, Rice)');
        } else {
          farmingConditions = 'good';
          recommendations.push('Good growing conditions');
          recommendations.push('Monitor for excessive rainfall');
        }
      } else {
        rainfall = 'low';
        temperature = month >= 11 && month <= 2 ? 'hot' : 'warm';
        humidity = 'low';
        
        if (month >= 12 && month <= 2) {
          farmingConditions = 'fair';
          recommendations.push('Requires irrigation systems');
          recommendations.push('Focus on drought-resistant crops');
        } else {
          farmingConditions = 'good';
          recommendations.push('Moderate conditions');
          recommendations.push('Prepare for dry season');
        }
      }

      // Location-specific adjustments
      if (location.toLowerCase().includes('south')) {
        if (season === 'rainy') {
          farmingConditions = 'excellent';
          recommendations.push('Southern regions have optimal rainfall');
        } else {
          farmingConditions = 'good';
          recommendations.push('Southern regions maintain some humidity');
        }
      } else if (location.toLowerCase().includes('north')) {
        if (season === 'dry') {
          farmingConditions = 'poor';
          recommendations.push('Northern regions are very dry');
          recommendations.push('Heavy irrigation required');
        }
      }

      // Add seasonal farming tips
      if (month === 3) {
        recommendations.push('Start preparing land for rainy season');
      } else if (month === 10) {
        recommendations.push('Harvest and prepare for dry season');
      }

      return {
        season,
        rainfall,
        temperature,
        humidity,
        farmingConditions,
        recommendations,
        confidence: 75 // Based on historical patterns
      };
    } catch (error) {
      logger.error('Weather prediction error: %s', (error as Error).message);
      throw error;
    }
  }

  // Market trend analysis and price prediction
  static async analyzeMarketTrends(cropName: string): Promise<MarketTrend> {
    try {
      // Get recent listing data for this crop
      const listings = await Listing.find({
        product: { $regex: cropName, $options: 'i' }
      }).sort({ createdAt: -1 }).limit(100);

      let currentPrice = 0;
      let priceChange = 0;
      let priceChangePercent = 0;
      let trend: 'strong_up' | 'up' | 'stable' | 'down' | 'strong_down' = 'stable';
      let volatility: 'low' | 'medium' | 'high' = 'medium';
      let prediction: 'price_will_rise' | 'price_will_fall' | 'price_will_stabilize' = 'price_will_stabilize';
      const factors: string[] = [];
      let confidence = 50;

      if (listings.length >= 20) {
        // Calculate current average price
        const recentPrices = listings.slice(0, 20).map(listing => listing.price);
        currentPrice = recentPrices.reduce((sum: number, price: number) => sum + price, 0) / recentPrices.length;

        // Calculate price change over time
        if (listings.length >= 40) {
          const olderPrices = listings.slice(40, 60).map(listing => listing.price);
          const olderAvg = olderPrices.reduce((sum: number, price: number) => sum + price, 0) / olderPrices.length;
          
          priceChange = currentPrice - olderAvg;
          priceChangePercent = (priceChange / olderAvg) * 100;

          // Determine trend
          if (priceChangePercent > 20) {
            trend = 'strong_up';
            prediction = 'price_will_rise';
            factors.push('Strong upward momentum');
          } else if (priceChangePercent > 10) {
            trend = 'up';
            prediction = 'price_will_rise';
            factors.push('Moderate upward trend');
          } else if (priceChangePercent < -20) {
            trend = 'strong_down';
            prediction = 'price_will_fall';
            factors.push('Strong downward pressure');
          } else if (priceChangePercent < -10) {
            trend = 'down';
            prediction = 'price_will_fall';
            factors.push('Moderate downward trend');
          } else {
            trend = 'stable';
            prediction = 'price_will_stabilize';
            factors.push('Price stability');
          }

          // Calculate volatility
          const priceVariance = recentPrices.reduce((sum, price) => {
            return sum + Math.pow(price - currentPrice, 2);
          }, 0) / recentPrices.length;
          const priceStdDev = Math.sqrt(priceVariance);
          const coefficientOfVariation = (priceStdDev / currentPrice) * 100;

          if (coefficientOfVariation > 30) {
            volatility = 'high';
            factors.push('High price volatility');
          } else if (coefficientOfVariation > 15) {
            volatility = 'medium';
            factors.push('Moderate price volatility');
          } else {
            volatility = 'low';
            factors.push('Low price volatility');
          }

          confidence = Math.min(listings.length * 2, 85);
        }
      } else {
        // Not enough data - use default values
        currentPrice = this.getDefaultPrice(cropName);
        factors.push('Limited market data available');
        confidence = 30;
      }

      // Add seasonal factors
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 3 && currentMonth <= 10 ? 'rainy' : 'dry';
      
      if (season === 'rainy') {
        if (['Yam', 'Maize', 'Rice', 'Beans'].includes(cropName)) {
          factors.push('Peak growing season');
          if (trend === 'stable') {
            prediction = 'price_will_rise';
            factors.push('Seasonal demand increase expected');
          }
        }
      } else {
        if (['Tomatoes', 'Pepper'].includes(cropName)) {
          factors.push('Peak growing season');
          if (trend === 'stable') {
            prediction = 'price_will_rise';
            factors.push('Seasonal demand increase expected');
          }
        }
      }

      // Add supply-demand factors
      const totalQuantity = listings.reduce((sum: number, listing: any) => sum + listing.quantity, 0);
      if (totalQuantity > 2000) {
        factors.push('High market supply');
        if (trend === 'up') {
          prediction = 'price_will_stabilize';
          factors.push('Supply may limit price increases');
        }
      } else if (totalQuantity < 500) {
        factors.push('Low market supply');
        if (trend === 'stable') {
          prediction = 'price_will_rise';
          factors.push('Supply constraints may drive prices up');
        }
      }

      return {
        crop: cropName,
        currentPrice: Math.round(currentPrice * 100) / 100,
        priceChange: Math.round(priceChange * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        trend,
        volatility,
        prediction,
        confidence,
        factors
      };
    } catch (error) {
      logger.error('Market trend analysis error: %s', (error as Error).message);
      throw error;
    }
  }

  // Risk assessment for farming operations
  static async assessRisk(cropName: string, location: string, season: string): Promise<RiskAssessment> {
    try {
      const riskFactors: string[] = [];
      const mitigationStrategies: string[] = [];
      
      // Weather risk assessment
      const weatherRisk = this.assessWeatherRisk(location, season);
      if (weatherRisk === 'high') {
        riskFactors.push('Unfavorable weather conditions');
        mitigationStrategies.push('Implement irrigation systems');
        mitigationStrategies.push('Choose drought-resistant crop varieties');
      }

      // Market risk assessment
      const marketTrend = await this.analyzeMarketTrends(cropName);
      let marketRisk: 'low' | 'medium' | 'high' = 'low';
      
      if (marketTrend.volatility === 'high') {
        marketRisk = 'high';
        riskFactors.push('High market price volatility');
        mitigationStrategies.push('Diversify crop portfolio');
        mitigationStrategies.push('Consider forward contracts');
      } else if (marketTrend.trend === 'strong_down') {
        marketRisk = 'high';
        riskFactors.push('Declining market prices');
        mitigationStrategies.push('Delay planting until market improves');
        mitigationStrategies.push('Focus on high-value alternatives');
      } else if (marketTrend.trend === 'down') {
        marketRisk = 'medium';
        riskFactors.push('Moderate price decline');
        mitigationStrategies.push('Optimize production costs');
        mitigationStrategies.push('Improve product quality');
      }

      // Pest and disease risk (seasonal)
      const pestRisk = this.assessPestRisk(season, cropName);
      const diseaseRisk = this.assessDiseaseRisk(season, cropName);
      
      if (pestRisk === 'high') {
        riskFactors.push('High pest pressure expected');
        mitigationStrategies.push('Implement integrated pest management');
        mitigationStrategies.push('Use resistant crop varieties');
      }
      
      if (diseaseRisk === 'high') {
        riskFactors.push('High disease pressure expected');
        mitigationStrategies.push('Practice crop rotation');
        mitigationStrategies.push('Use disease-resistant varieties');
      }

      // Overall risk calculation
      const riskScores = {
        weather: weatherRisk === 'high' ? 3 : weatherRisk === 'medium' ? 2 : 1,
        market: marketRisk === 'high' ? 3 : marketRisk === 'medium' ? 2 : 1,
        pest: pestRisk === 'high' ? 3 : pestRisk === 'medium' ? 2 : 1,
        disease: diseaseRisk === 'high' ? 3 : diseaseRisk === 'medium' ? 2 : 1
      };

      const totalRiskScore = Object.values(riskScores).reduce((sum, score) => sum + score, 0);
      const overallRisk: 'low' | 'medium' | 'high' = 
        totalRiskScore <= 6 ? 'low' : totalRiskScore <= 9 ? 'medium' : 'high';

      // Insurance recommendation
      const insuranceRecommendation = overallRisk === 'high' || marketRisk === 'high';

      // Add general mitigation strategies
      if (overallRisk === 'high') {
        mitigationStrategies.push('Consider crop insurance');
        mitigationStrategies.push('Implement risk management plan');
        mitigationStrategies.push('Diversify farming operations');
      } else if (overallRisk === 'medium') {
        mitigationStrategies.push('Monitor conditions closely');
        mitigationStrategies.push('Have backup plans ready');
      }

      return {
        crop: cropName,
        overallRisk,
        weatherRisk,
        marketRisk,
        pestRisk,
        diseaseRisk,
        riskFactors,
        mitigationStrategies,
        insuranceRecommendation
      };
    } catch (error) {
      logger.error('Risk assessment error: %s', (error as Error).message);
      throw error;
    }
  }

  // Get comprehensive predictive insights
  static async getPredictiveInsights(
    cropName: string, 
    location: string, 
    month: number
  ): Promise<any> {
    try {
      const season = month >= 3 && month <= 10 ? 'rainy' : 'dry';
      
      const [weatherPrediction, marketTrend, riskAssessment] = await Promise.all([
        this.predictWeather(location, month),
        this.analyzeMarketTrends(cropName),
        this.assessRisk(cropName, location, season)
      ]);

      // Create farming calendar recommendations
      const farmingCalendar = this.createFarmingCalendar(cropName, month, season);
      
      // Generate actionable insights
      const insights = {
        weather: weatherPrediction,
        market: marketTrend,
        risk: riskAssessment,
        calendar: farmingCalendar,
        recommendations: this.generateActionableRecommendations(
          weatherPrediction,
          marketTrend,
          riskAssessment,
          farmingCalendar
        )
      };

      return insights;
    } catch (error) {
      logger.error('Predictive insights error: %s', (error as Error).message);
      throw error;
    }
  }

  // Private helper methods
  private static assessWeatherRisk(location: string, season: string): 'low' | 'medium' | 'high' {
    if (season === 'dry' && location.toLowerCase().includes('north')) {
      return 'high';
    } else if (season === 'dry' && location.toLowerCase().includes('south')) {
      return 'medium';
    } else if (season === 'rainy') {
      return 'low';
    }
    return 'medium';
  }

  private static assessPestRisk(season: string, cropName: string): 'low' | 'medium' | 'high' {
    if (season === 'rainy') {
      if (['Maize', 'Rice'].includes(cropName)) {
        return 'high'; // Common pests in rainy season
      }
      return 'medium';
    } else {
      if (['Tomatoes', 'Pepper'].includes(cropName)) {
        return 'medium'; // Some pests in dry season
      }
      return 'low';
    }
  }

  private static assessDiseaseRisk(season: string, cropName: string): 'low' | 'medium' | 'high' {
    if (season === 'rainy') {
      if (['Cassava', 'Yam'].includes(cropName)) {
        return 'high'; // Fungal diseases common in wet conditions
      }
      return 'medium';
    } else {
      return 'low';
    }
  }

  private static getDefaultPrice(cropName: string): number {
    const prices: Record<string, number> = {
      'Cassava': 150, 'Yam': 300, 'Maize': 200, 'Rice': 400,
      'Beans': 800, 'Tomatoes': 250, 'Pepper': 1200, 'Cocoa': 1500, 'Palm Oil': 800
    };
    return prices[cropName] || 500;
  }

  private static createFarmingCalendar(cropName: string, month: number, season: string): any {
          const calendar: {
        currentMonth: number;
        season: string;
        activities: string[];
        timeline: Array<{ month: string; activity: string }>;
      } = {
        currentMonth: month,
        season,
        activities: [],
        timeline: []
      };

    if (season === 'rainy') {
      if (month >= 3 && month <= 5) {
        calendar.activities.push('Land preparation and early planting');
        calendar.timeline.push({ month: 'March-April', activity: 'Prepare land and plant early crops' });
      } else if (month >= 6 && month <= 8) {
        calendar.activities.push('Main growing season and maintenance');
        calendar.timeline.push({ month: 'June-August', activity: 'Monitor growth and manage pests' });
      } else if (month >= 9 && month <= 10) {
        calendar.activities.push('Harvest preparation and late planting');
        calendar.timeline.push({ month: 'September-October', activity: 'Prepare for harvest and plant late crops' });
      }
    } else {
      if (month >= 11 && month <= 12) {
        calendar.activities.push('Dry season preparation and irrigation setup');
        calendar.timeline.push({ month: 'November-December', activity: 'Set up irrigation and plant drought-resistant crops' });
      } else if (month >= 1 && month <= 2) {
        calendar.activities.push('Dry season farming and maintenance');
        calendar.timeline.push({ month: 'January-February', activity: 'Maintain irrigation and monitor crops' });
      }
    }

    return calendar;
  }

  private static generateActionableRecommendations(
    weather: WeatherPrediction,
    market: MarketTrend,
    risk: RiskAssessment,
    calendar: any
  ): string[] {
    const recommendations: string[] = [];

    // Weather-based recommendations
    if (weather.farmingConditions === 'excellent') {
      recommendations.push('Expand production - conditions are optimal');
    } else if (weather.farmingConditions === 'poor') {
      recommendations.push('Consider alternative crops or delay planting');
    }

    // Market-based recommendations
    if (market.prediction === 'price_will_rise') {
      recommendations.push('Consider increasing production for better returns');
    } else if (market.prediction === 'price_will_fall') {
      recommendations.push('Focus on cost optimization and quality improvement');
    }

    // Risk-based recommendations
    if (risk.overallRisk === 'high') {
      recommendations.push('Implement comprehensive risk management plan');
      recommendations.push('Consider crop insurance for protection');
    }

    // Calendar-based recommendations
    if (calendar.activities.length > 0) {
      recommendations.push(`Current focus: ${calendar.activities[0]}`);
    }

    return recommendations;
  }
}
