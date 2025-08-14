import { IoTSensor } from '../models/iotSensor.model';
import { CropAnalysis } from '../models/cropAnalysis.model';
import { Harvest } from '../models/harvest.model';
import { Listing } from '../models/listing.model';
import { logger } from '../index';

export interface PredictiveMaintenance {
  sensorId: string;
  issue: string;
  probability: number;
  estimatedTimeToFailure: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  confidence: number;
}

export interface AnomalyDetection {
  sensorId: string;
  metric: string;
  anomalyType: 'spike' | 'drop' | 'trend' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  expectedValue: number;
  actualValue: number;
  confidence: number;
}

export interface OptimizationResult {
  type: 'irrigation' | 'fertilizer' | 'pesticide' | 'harvest' | 'equipment';
  currentEfficiency: number;
  optimizedEfficiency: number;
  improvement: number;
  recommendations: string[];
  estimatedSavings: number;
  implementationCost: number;
  roi: number;
}

export class AdvancedMLService {
  // Predictive Maintenance for IoT Sensors
  static async predictMaintenance(sensorId: string): Promise<PredictiveMaintenance | null> {
    try {
      const sensor = await IoTSensor.findById(sensorId);
      if (!sensor) return null;

      const maintenance = await this.analyzeSensorHealth(sensor);
      return maintenance;
    } catch (error) {
      logger.error('Error predicting maintenance: %s', (error as Error).message);
      return null;
    }
  }

  // Anomaly Detection for Sensor Data
  static async detectAnomalies(sensorId: string, timeRange: number = 24): Promise<AnomalyDetection[]> {
    try {
      const sensor = await IoTSensor.findById(sensorId);
      if (!sensor) return [];

      const anomalies: AnomalyDetection[] = [];
      const recentReadings = sensor.readings.slice(-timeRange);

      if (recentReadings.length < 3) return [];

      // Detect spikes and drops
      const spikeAnomalies = this.detectSpikes(recentReadings, sensor.thresholds);
      const dropAnomalies = this.detectDrops(recentReadings, sensor.thresholds);
      const trendAnomalies = this.detectTrendAnomalies(recentReadings);

      anomalies.push(...spikeAnomalies, ...dropAnomalies, ...trendAnomalies);

      return anomalies;
    } catch (error) {
      logger.error('Error detecting anomalies: %s', (error as Error).message);
      return [];
    }
  }

  // Optimization Algorithms
  static async optimizeIrrigation(farmerId: string): Promise<OptimizationResult | null> {
    try {
      const sensors = await IoTSensor.find({ 
        farmer: farmerId, 
        sensorType: 'soil' 
      });

      if (sensors.length === 0) return null;

      const optimization = await this.calculateIrrigationOptimization(sensors);
      return optimization;
    } catch (error) {
      logger.error('Error optimizing irrigation: %s', (error as Error).message);
      return null;
    }
  }

  static async optimizeFertilizer(farmerId: string): Promise<OptimizationResult | null> {
    try {
      const soilSensors = await IoTSensor.find({ 
        farmer: farmerId, 
        sensorType: 'soil' 
      });

      const cropAnalyses = await CropAnalysis.find({ 
        farmer: farmerId,
        analysisType: 'nutrient'
      });

      if (soilSensors.length === 0 && cropAnalyses.length === 0) return null;

      const optimization = await this.calculateFertilizerOptimization(soilSensors, cropAnalyses);
      return optimization;
    } catch (error) {
      logger.error('Error optimizing fertilizer: %s', (error as Error).message);
      return null;
    }
  }

  static async optimizeHarvest(farmerId: string): Promise<OptimizationResult | null> {
    try {
      const harvests = await Harvest.find({ farmer: farmerId }).sort({ createdAt: -1 }).limit(50);
      const listings = await Listing.find({ farmer: farmerId }).sort({ createdAt: -1 }).limit(50);

      if (harvests.length === 0) return null;

      const optimization = await this.calculateHarvestOptimization(harvests, listings);
      return optimization;
    } catch (error) {
      logger.error('Error optimizing harvest: %s', (error as Error).message);
      return null;
    }
  }

  // Private helper methods
  private static async analyzeSensorHealth(sensor: any): Promise<PredictiveMaintenance> {
    let issue = 'No issues detected';
    let probability = 0;
    let estimatedTimeToFailure = 365;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let recommendations: string[] = [];
    let confidence = 0;

    if (sensor.batteryLevel < 20) {
      issue = 'Low battery level';
      probability = 90;
      estimatedTimeToFailure = Math.max(1, Math.floor(sensor.batteryLevel * 0.5));
      severity = 'critical';
      recommendations.push('Replace battery immediately');
      confidence = 95;
    }

    if (sensor.signalStrength < 30) {
      issue = 'Poor signal strength';
      probability = Math.max(probability, 70);
      estimatedTimeToFailure = Math.min(estimatedTimeToFailure, 30);
      severity = severity === 'critical' ? 'critical' : 'high';
      recommendations.push('Check antenna connection', 'Move sensor closer to gateway');
      confidence = Math.max(confidence, 85);
    }

    return {
      sensorId: sensor.sensorId,
      issue,
      probability,
      estimatedTimeToFailure,
      severity,
      recommendations,
      confidence
    };
  }

  private static detectSpikes(readings: any[], thresholds: any): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    for (let i = 1; i < readings.length - 1; i++) {
      const current = readings[i];
      const previous = readings[i - 1];
      const next = readings[i + 1];
      
      const avgNeighbors = (previous.value + next.value) / 2;
      const spikeThreshold = thresholds.max * 1.5;
      
      if (current.value > avgNeighbors * 2 && current.value > spikeThreshold) {
        anomalies.push({
          sensorId: 'unknown',
          metric: current.metric,
          anomalyType: 'spike',
          severity: current.value > thresholds.critical ? 'critical' : 'high',
          description: `Unusual spike in ${current.metric} detected`,
          timestamp: current.timestamp,
          expectedValue: avgNeighbors,
          actualValue: current.value,
          confidence: 85
        });
      }
    }
    
    return anomalies;
  }

  private static detectDrops(readings: any[], thresholds: any): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    for (let i = 1; i < readings.length - 1; i++) {
      const current = readings[i];
      const previous = readings[i - 1];
      const next = readings[i + 1];
      
      const avgNeighbors = (previous.value + next.value) / 2;
      const dropThreshold = thresholds.min * 0.5;
      
      if (current.value < avgNeighbors * 0.5 && current.value < dropThreshold) {
        anomalies.push({
          sensorId: 'unknown',
          metric: current.metric,
          anomalyType: 'drop',
          severity: current.value < thresholds.critical ? 'critical' : 'high',
          description: `Unusual drop in ${current.metric} detected`,
          timestamp: current.timestamp,
          expectedValue: avgNeighbors,
          actualValue: current.value,
          confidence: 85
        });
      }
    }
    
    return anomalies;
  }

  private static detectTrendAnomalies(readings: any[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    if (readings.length < 5) return anomalies;
    
    const values = readings.map(r => r.value);
    const trend = this.calculateTrend(values);
    
    if (Math.abs(trend) > 0.1) {
      anomalies.push({
        sensorId: 'unknown',
        metric: readings[0].metric,
        anomalyType: 'trend',
        severity: Math.abs(trend) > 0.3 ? 'high' : 'medium',
        description: `Significant ${trend > 0 ? 'increasing' : 'decreasing'} trend detected`,
        timestamp: readings[readings.length - 1].timestamp,
        expectedValue: values[0],
        actualValue: values[values.length - 1],
        confidence: 70
      });
    }
    
    return anomalies;
  }

  private static calculateTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val, i) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = values.reduce((sum, val, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private static async calculateIrrigationOptimization(sensors: any[]): Promise<OptimizationResult> {
    const currentEfficiency = 75;
    let optimizedEfficiency = currentEfficiency;
    const recommendations: string[] = [];
    
    if (sensors.length > 0) {
      optimizedEfficiency += 15;
      recommendations.push('Implement smart irrigation scheduling', 'Use soil moisture data for optimization');
    }
    
    const improvement = optimizedEfficiency - currentEfficiency;
    const estimatedSavings = improvement * 0.5;
    const implementationCost = 500;
    const roi = (estimatedSavings * 12) / implementationCost;
    
    return {
      type: 'irrigation',
      currentEfficiency,
      optimizedEfficiency,
      improvement,
      recommendations,
      estimatedSavings,
      implementationCost,
      roi
    };
  }

  private static async calculateFertilizerOptimization(soilSensors: any[], cropAnalyses: any[]): Promise<OptimizationResult> {
    const currentEfficiency = 70;
    let optimizedEfficiency = currentEfficiency;
    const recommendations: string[] = [];
    
    if (soilSensors.length > 0) {
      optimizedEfficiency += 12;
      recommendations.push('Implement precision fertilization', 'Use soil sensor data for targeted application');
    }
    
    const improvement = optimizedEfficiency - currentEfficiency;
    const estimatedSavings = improvement * 0.8;
    const implementationCost = 800;
    const roi = (estimatedSavings * 12) / implementationCost;
    
    return {
      type: 'fertilizer',
      currentEfficiency,
      optimizedEfficiency,
      improvement,
      recommendations,
      estimatedSavings,
      implementationCost,
      roi
    };
  }

  private static async calculateHarvestOptimization(harvests: any[], listings: any[]): Promise<OptimizationResult> {
    const currentEfficiency = 65;
    let optimizedEfficiency = currentEfficiency;
    const recommendations: string[] = [];
    
    if (harvests.length > 0) {
      optimizedEfficiency += 10;
      recommendations.push('Optimize harvest timing for better quality', 'Implement early harvest for premium markets');
    }
    
    const improvement = optimizedEfficiency - currentEfficiency;
    const estimatedSavings = improvement * 1.2;
    const implementationCost = 1200;
    const roi = (estimatedSavings * 12) / implementationCost;
    
    return {
      type: 'harvest',
      currentEfficiency,
      optimizedEfficiency,
      improvement,
      recommendations,
      estimatedSavings,
      implementationCost,
      roi
    };
  }
}
