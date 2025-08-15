import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { IoTSensor } from '../models/iotSensor.model';
import { AdvancedMLService } from '../services/advancedML.service';
import { logger } from '../index';
import Joi from 'joi';

export class IoTController {
  // Register new IoT sensor
  static async registerSensor(req: AuthRequest, res: Response) {
    try {
      const schema = Joi.object({
        sensorId: Joi.string().required(),
        sensorType: Joi.string().valid('soil', 'weather', 'crop', 'equipment', 'water', 'air').required(),
        location: Joi.object({
          latitude: Joi.number().min(-90).max(90).required(),
          longitude: Joi.number().min(-180).max(180).required(),
          altitude: Joi.number().optional(),
          fieldId: Joi.string().optional()
        }).required(),
        thresholds: Joi.object({
          min: Joi.number().required(),
          max: Joi.number().required(),
          critical: Joi.number().required()
        }).required(),
        metadata: Joi.object({
          manufacturer: Joi.string().required(),
          model: Joi.string().required(),
          firmware: Joi.string().required(),
          installationDate: Joi.date().required(),
          lastCalibration: Joi.date().required(),
          nextCalibration: Joi.date().required()
        }).required()
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
      
      // Check if sensor already exists
      const existingSensor = await IoTSensor.findOne({ sensorId: value.sensorId });
      if (existingSensor) {
        return res.status(400).json({
          success: false,
          message: 'Sensor with this ID already exists'
        });
      }

      const sensor = new IoTSensor({
        ...value,
        farmer: farmerId,
        status: 'active',
        batteryLevel: 100,
        signalStrength: 100,
        readings: [],
        alerts: []
      });

      await sensor.save();

      logger.info('New IoT sensor registered: %s', value.sensorId);

      res.status(201).json({
        success: true,
        message: 'IoT sensor registered successfully',
        data: sensor
      });
    } catch (error) {
      logger.error('Error registering IoT sensor: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all sensors for a farmer
  static async getFarmerSensors(req: AuthRequest, res: Response) {
    try {
      const farmerId = (req.user as any).id;
      const sensors = await IoTSensor.find({ farmer: farmerId }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: sensors,
        count: sensors.length
      });
    } catch (error) {
      logger.error('Error getting farmer sensors: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get sensor by ID
  static async getSensorById(req: AuthRequest, res: Response) {
    try {
      const { sensorId } = req.params;
      const farmerId = (req.user as any).id;

      const sensor = await IoTSensor.findOne({ _id: sensorId, farmer: farmerId });
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }

      res.json({
        success: true,
        data: sensor
      });
    } catch (error) {
      logger.error('Error getting sensor: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update sensor data
  static async updateSensorData(req: Request, res: Response) {
    try {
      const { sensorId } = req.params;
      const { value, unit, metric, quality } = req.body;

      const schema = Joi.object({
        value: Joi.number().required(),
        unit: Joi.string().required(),
        metric: Joi.string().required(),
        quality: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional()
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const sensor = await IoTSensor.findById(sensorId);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }

      // Add new reading
      sensor.readings.push({
        timestamp: new Date(),
        value,
        unit,
        metric,
        quality: quality || 'good'
      });
      
      // Keep only last 1000 readings
      if (sensor.readings.length > 1000) {
        sensor.readings = sensor.readings.slice(-1000);
      }

      // Check thresholds and create alerts if needed
      if (value < sensor.thresholds.min || value > sensor.thresholds.max) {
        const alertType = value < sensor.thresholds.min ? 'threshold' : 'threshold';
        const severity = value < sensor.thresholds.critical || value > sensor.thresholds.critical ? 'critical' : 'high';
        const message = `Value ${value} ${unit} is outside normal range (${sensor.thresholds.min}-${sensor.thresholds.max} ${unit})`;
        
        sensor.alerts.push({
          type: alertType,
          message,
          severity,
          timestamp: new Date(),
          resolved: false
        });
      }

      logger.info('Sensor data updated: %s - %s %s', sensorId, value, unit);

      res.json({
        success: true,
        message: 'Sensor data updated successfully',
        data: sensor.readings.length > 0 ? sensor.readings[sensor.readings.length - 1] : null
      });
    } catch (error) {
      logger.error('Error updating sensor data: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get sensor readings
  static async getSensorReadings(req: Request, res: Response) {
    try {
      const { sensorId } = req.params;
      const { limit = 100, startDate, endDate } = req.query;

      const sensor = await IoTSensor.findById(sensorId);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }

      let readings = sensor.readings;

      // Filter by date range if provided
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate as string) : new Date(0);
        const end = endDate ? new Date(endDate as string) : new Date();
        
        readings = readings.filter(reading => 
          reading.timestamp >= start && reading.timestamp <= end
        );
      }

      // Limit results
      readings = readings.slice(-Math.min(Number(limit), 1000));

      res.json({
        success: true,
        data: readings,
        count: readings.length,
        sensorInfo: {
          sensorId: sensor.sensorId,
          sensorType: sensor.sensorType,
          location: sensor.location
        }
      });
    } catch (error) {
      logger.error('Error getting sensor readings: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get sensor alerts
  static async getSensorAlerts(req: Request, res: Response) {
    try {
      const { sensorId } = req.params;
      const { resolved } = req.query;

      const sensor = await IoTSensor.findById(sensorId);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }

      let alerts = sensor.alerts;

      // Filter by resolved status if provided
      if (resolved !== undefined) {
        const isResolved = resolved === 'true';
        alerts = alerts.filter(alert => alert.resolved === isResolved);
      }

      res.json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      logger.error('Error getting sensor alerts: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Resolve sensor alert
  static async resolveAlert(req: Request, res: Response) {
    try {
      const { sensorId, alertIndex } = req.params;

      const sensor = await IoTSensor.findById(sensorId);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }

      const alertIndexNum = parseInt(alertIndex);
      if (alertIndexNum < 0 || alertIndexNum >= sensor.alerts.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid alert index'
        });
      }

      if (sensor.alerts[alertIndexNum]) {
        sensor.alerts[alertIndexNum].resolved = true;
      }

      logger.info('Alert resolved for sensor: %s, alert index: %s', sensorId, alertIndex);

      res.json({
        success: true,
        message: 'Alert resolved successfully'
      });
    } catch (error) {
      logger.error('Error resolving alert: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update sensor status
  static async updateSensorStatus(req: Request, res: Response) {
    try {
      const { sensorId } = req.params;
      const { status, batteryLevel, signalStrength } = req.body;

      const schema = Joi.object({
        status: Joi.string().valid('active', 'inactive', 'maintenance', 'error').optional(),
        batteryLevel: Joi.number().min(0).max(100).optional(),
        signalStrength: Joi.number().min(0).max(100).optional()
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const sensor = await IoTSensor.findById(sensorId);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }

      // Update fields if provided
      if (status !== undefined) sensor.status = status;
      if (batteryLevel !== undefined) sensor.batteryLevel = batteryLevel;
      if (signalStrength !== undefined) sensor.signalStrength = signalStrength;

      // Create alerts for critical levels
      if (batteryLevel !== undefined && batteryLevel < 20) {
        sensor.alerts.push({
          type: 'battery',
          message: `Low battery level: ${batteryLevel}%`,
          severity: 'critical',
          timestamp: new Date(),
          resolved: false
        });
      }

      if (signalStrength !== undefined && signalStrength < 30) {
        sensor.alerts.push({
          type: 'signal',
          message: `Poor signal strength: ${signalStrength}%`,
          severity: 'high',
          timestamp: new Date(),
          resolved: false
        });
      }

      await sensor.save();

      logger.info('Sensor status updated: %s', sensorId);

      res.json({
        success: true,
        message: 'Sensor status updated successfully',
        data: sensor
      });
    } catch (error) {
      logger.error('Error updating sensor status: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get predictive maintenance
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

  // Detect anomalies
  static async detectAnomalies(req: Request, res: Response) {
    try {
      const { sensorId } = req.params;
      const { timeRange = 24 } = req.query;

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

  // Get sensor health summary
  static async getSensorHealthSummary(req: AuthRequest, res: Response) {
    try {
      const farmerId = (req.user as any).id;

      const sensors = await IoTSensor.find({ farmer: farmerId });
      
      const summary = {
        totalSensors: sensors.length,
        activeSensors: sensors.filter(s => s.status === 'active').length,
        maintenanceNeeded: sensors.filter(s => s.status === 'maintenance').length,
        errorSensors: sensors.filter(s => s.status === 'error').length,
        lowBattery: sensors.filter(s => s.batteryLevel < 20).length,
        poorSignal: sensors.filter(s => s.signalStrength < 30).length,
        totalAlerts: sensors.reduce((sum, s) => sum + s.alerts.filter(a => !a.resolved).length, 0),
        criticalAlerts: sensors.reduce((sum, s) => sum + s.alerts.filter(a => !a.resolved && a.severity === 'critical').length, 0)
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error('Error getting sensor health summary: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete sensor
  static async deleteSensor(req: AuthRequest, res: Response) {
    try {
      const { sensorId } = req.params;
      const farmerId = (req.user as any).id;

      const sensor = await IoTSensor.findOne({ _id: sensorId, farmer: farmerId });
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: 'Sensor not found'
        });
      }

      await IoTSensor.findByIdAndDelete(sensorId);

      logger.info('IoT sensor deleted: %s', sensorId);

      res.json({
        success: true,
        message: 'Sensor deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting sensor: %s', (error as Error).message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
