import { Request, Response } from 'express';
import { Listing } from '../models/listing.model';
import { Order } from '../models/order.model';
import Joi from 'joi';

const listingSchema = Joi.object({
  product: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().required(),
  farmer: Joi.string().required(),
  partner: Joi.string().required(),
  images: Joi.array().items(Joi.string()).optional(),
});

export const getListings = async (req: Request, res: Response) => {
  try {
    const listings = await Listing.find({ status: 'active' })
      .populate('farmer')
      .populate('partner');
    return res.status(200).json({ status: 'success', listings });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const { error, value } = listingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const listing = new Listing(value);
    await listing.save();
    return res.status(201).json({ status: 'success', listing });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { buyer, items } = req.body;
    if (!buyer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid order input.' });
    }
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const listing = await Listing.findById(item.listing);
      if (!listing || listing.status !== 'active') {
        return res.status(400).json({ status: 'error', message: 'Invalid or unavailable listing.' });
      }
      if (item.quantity > listing.quantity) {
        return res.status(400).json({ status: 'error', message: 'Insufficient quantity for listing.' });
      }
      total += item.quantity * listing.price;
      orderItems.push({ listing: listing._id, quantity: item.quantity, price: listing.price });
    }
    const order = new Order({ buyer, items: orderItems, total, status: 'pending' });
    await order.save();
    return res.status(201).json({ status: 'success', order });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'paid', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status.' });
    }
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }
    return res.status(200).json({ status: 'success', order });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
