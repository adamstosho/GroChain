import { Request, Response } from 'express';
import { Harvest } from '../models/harvest.model';
import { generateQRCode } from '../utils/qr.util';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const harvestSchema = Joi.object({
  farmer: Joi.string().required(),
  cropType: Joi.string().required(),
  quantity: Joi.number().required(),
  date: Joi.date().required(),
  geoLocation: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
});

export const createHarvest = async (req: Request, res: Response) => {
  try {
    const { error, value } = harvestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const batchId = uuidv4();
    const qrData = await generateQRCode(batchId);
    const harvest = new Harvest({ ...value, batchId, qrData });
    await harvest.save();
    return res.status(201).json({ status: 'success', harvest, qrData });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const getProvenance = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const harvest = await Harvest.findOne({ batchId }).populate('farmer');
    if (!harvest) {
      return res.status(404).json({ status: 'error', message: 'Harvest batch not found.' });
    }
    return res.status(200).json({ status: 'success', provenance: harvest });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
