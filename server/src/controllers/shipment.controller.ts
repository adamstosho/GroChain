import { Request, Response } from 'express';
import { Shipment } from '../models/shipment.model';
import Joi from 'joi';

const shipmentSchema = Joi.object({
  harvestBatch: Joi.string().required(),
  source: Joi.string().required(),
  destination: Joi.string().required(),
  timestamp: Joi.date().required(),
});

export const createShipment = async (req: Request, res: Response) => {
  try {
    const { error, value } = shipmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const shipment = new Shipment(value);
    await shipment.save();
    return res.status(201).json({ status: 'success', shipment });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
