import { Request, Response } from 'express';
import { Listing } from '../models/listing.model';
import { Order } from '../models/order.model';
import Joi from 'joi';
import { Favorite } from '../models/favorite.model';

const listingSchema = Joi.object({
  product: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().required(),
  farmer: Joi.string().required(),
  partner: Joi.string().required(),
  images: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
});

export const getListings = async (req: Request, res: Response) => {
  try {
    const {
      search,
      product,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      farmer,
      partner,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter: any = { status: 'active' };

    // Text search across product name and description
    if (search) {
      filter.$or = [
        { product: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }

    // Product filter
    if (product) {
      filter.product = { $regex: product as string, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    // Quantity range filter
    if (minQuantity || maxQuantity) {
      filter.quantity = {};
      if (minQuantity) filter.quantity.$gte = parseInt(minQuantity as string);
      if (maxQuantity) filter.quantity.$lte = parseInt(maxQuantity as string);
    }

    // Farmer filter
    if (farmer) {
      filter.farmer = farmer;
    }

    // Partner filter
    if (partner) {
      filter.partner = partner;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Execute query with pagination
    const listings = await Listing.find(filter)
      .populate('farmer', 'name email phone')
      .populate('partner', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string));

    // Get total count for pagination
    const total = await Listing.countDocuments(filter);

    return res.status(200).json({ 
      status: 'success', 
      listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const getListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const listing = await Listing.findById(id)
      .populate('farmer', 'name email phone')
      .populate('partner', 'name email phone');
    
    if (!listing) {
      return res.status(404).json({ status: 'error', message: 'Listing not found.' });
    }
    
    return res.status(200).json({ status: 'success', listing });
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

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || (q as string).length < 2) {
      return res.status(200).json({ status: 'success', suggestions: [] });
    }

    // Get product suggestions
    const productSuggestions = await Listing.distinct('product', {
      product: { $regex: q as string, $options: 'i' },
      status: 'active'
    });

    // Get unique products with their counts
    const suggestions = productSuggestions.slice(0, 10).map(product => ({
      type: 'product',
      value: product,
      label: product
    }));

    return res.status(200).json({ 
      status: 'success', 
      suggestions 
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// Buyer order management
export const getBuyerOrders = async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    // Build filter object
    const filter: any = { buyer: buyerId };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Execute query with pagination
    const orders = await Order.find(filter)
      .populate('items.listing', 'product price images')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    return res.status(200).json({ 
      status: 'success', 
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('items.listing', 'product price images description')
      .populate('buyer', 'name email phone')
      .populate('items.listing.farmer', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }
    
    return res.status(200).json({ status: 'success', order });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ status: 'error', message: 'Only pending orders can be cancelled.' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    return res.status(200).json({ status: 'success', order });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const getOrderTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id).select('status createdAt updatedAt');
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }
    
    // Mock tracking data - in real implementation, this would come from logistics service
    const tracking = {
      orderId: id,
      status: order.status,
      timeline: [
        {
          status: 'order_placed',
          timestamp: order.createdAt,
          description: 'Order placed successfully'
        },
        {
          status: 'confirmed',
          timestamp: new Date(order.createdAt.getTime() + 1000 * 60 * 60), // 1 hour later
          description: 'Order confirmed by seller'
        },
        ...(order.status !== 'pending' ? [{
          status: order.status,
          timestamp: order.updatedAt,
          description: `Order ${order.status}`
        }] : [])
      ]
    };
    
    return res.status(200).json({ status: 'success', tracking });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// Favorites/Wishlist
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId) {
       return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Get user's favorites with populated listing details
    const favorites = await Favorite.find({ userId })
      .populate({
        path: 'listing',
        model: 'Listing',
        populate: {
          path: 'farmer',
          model: 'User',
          select: 'name email location rating'
        }
      })
      .sort({ createdAt: -1 });

    // Transform the data to match frontend expectations
    const transformedFavorites = favorites.map(fav => {
      const favoriteDoc = fav.toObject();
      const listing = (favoriteDoc as any).listing as any;
      return {
        _id: favoriteDoc._id,
        product: listing?.title || listing?.product,
        price: listing?.price,
        quantity: listing?.quantity,
        unit: listing?.unit,
        images: listing?.images || [],
        farmer: {
          name: listing?.farmer?.name || 'Unknown Farmer',
          location: listing?.farmer?.location || 'Unknown Location',
          rating: (listing?.farmer as any)?.rating || 0
        },
        status: listing?.status || 'active',
        createdAt: favoriteDoc.createdAt,
        updatedAt: favoriteDoc.updatedAt
      };
    });

    return res.status(200).json({ 
      success: true,
      data: {
        favorites: transformedFavorites 
      }
    });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch favorites' });
  }
};

export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { userId, listingId } = req.body;
    
    // Validate required fields
    if (!userId || !listingId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID and Listing ID are required' 
      });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({ userId, listingId });
    if (existingFavorite) {
      return res.status(400).json({ 
        success: false,
        message: 'Product is already in favorites' 
      });
    }

    // Add to favorites
    const newFavorite = new Favorite({
      userId,
      listingId
    });
    
    await newFavorite.save();

    return res.status(201).json({ 
      success: true,
      message: 'Added to favorites successfully',
      data: {
        favorite: newFavorite
      }
    });
  } catch (err) {
    console.error('Error adding to favorites:', err);
    return res.status(500).json({ success: false, message: 'Failed to add to favorites' });
  }
};

export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { userId, listingId } = req.params;
    
    // Validate required fields
    if (!userId || !listingId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID and Listing ID are required' 
      });
    }

    // Remove from favorites
    const deletedFavorite = await Favorite.findOneAndDelete({ userId, listingId });
    
    if (!deletedFavorite) {
      return res.status(404).json({ 
        success: false,
        message: 'Favorite not found' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Removed from favorites successfully' 
    });
  } catch (err) {
    console.error('Error removing from favorites:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove from favorites' });
  }
};
