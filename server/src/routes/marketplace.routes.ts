import { Router } from 'express';
import { 
  getListings, 
  getListing, 
  createListing, 
  createOrder, 
  updateOrderStatus, 
  getSearchSuggestions,
  getBuyerOrders,
  getOrderDetails,
  cancelOrder,
  getOrderTracking,
  getFavorites,
  addToFavorites,
  removeFromFavorites
} from '../controllers/marketplace.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import Joi from 'joi';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.util';
import { Listing } from '../models/listing.model';

const router = Router();

router.get('/listings', getListings);
router.get('/listings/:id', getListing);
router.get('/search-suggestions', getSearchSuggestions);
// Listing management
router.patch('/listings/:id', authenticateJWT, authorizeRoles('farmer','partner','admin'), validateRequest(Joi.object({
  product: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  quantity: Joi.number().integer().positive().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
})), async (req, res) => {
  try {
    const { id } = req.params
    const updates: any = req.body
    const listing = await Listing.findByIdAndUpdate(id, updates, { new: true })
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' })
    return res.json({ status: 'success', listing })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error.' })
  }
});
router.patch('/listings/:id/unpublish', authenticateJWT, authorizeRoles('farmer','partner','admin'), async (req, res) => {
  try {
    const { id } = req.params
    const listing = await Listing.findByIdAndUpdate(id, { status: 'removed' }, { new: true })
    if (!listing) return res.status(404).json({ status: 'error', message: 'Listing not found' })
    return res.json({ status: 'success', listing })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error.' })
  }
});
router.post(
  '/listings',
  authenticateJWT,
  authorizeRoles('farmer', 'partner', 'admin'),
  validateRequest(
    Joi.object({
      product: Joi.string().required(),
      price: Joi.number().positive().required(),
      quantity: Joi.number().integer().positive().required(),
      farmer: Joi.string().required(),
      partner: Joi.string().required(),
      images: Joi.array().items(Joi.string().uri()).optional(),
    })
  ),
  createListing
);
router.post(
  '/orders',
  authenticateJWT,
  authorizeRoles('buyer', 'farmer', 'partner', 'admin'),
  validateRequest(
    Joi.object({
      buyer: Joi.string().required(),
      items: Joi.array().items(
        Joi.object({ listing: Joi.string().required(), quantity: Joi.number().integer().positive().required() })
      ).min(1).required(),
    })
  ),
  createOrder
);
router.patch(
  '/orders/:id/status',
  authenticateJWT,
  authorizeRoles('partner', 'aggregator', 'admin'),
  validateRequest(Joi.object({ status: Joi.string().valid('pending', 'paid', 'delivered', 'cancelled').required() })),
  updateOrderStatus
);

// Buyer order management
router.get(
  '/orders/buyer/:buyerId',
  authenticateJWT,
  authorizeRoles('buyer', 'admin'),
  getBuyerOrders
);

router.get(
  '/orders/:id',
  authenticateJWT,
  authorizeRoles('buyer', 'farmer', 'partner', 'admin'),
  getOrderDetails
);

router.patch(
  '/orders/:id/cancel',
  authenticateJWT,
  authorizeRoles('buyer', 'admin'),
  cancelOrder
);

router.get(
  '/orders/:id/tracking',
  authenticateJWT,
  authorizeRoles('buyer', 'farmer', 'partner', 'admin'),
  getOrderTracking
);

// Favorites/Wishlist
router.get(
  '/favorites/:userId',
  authenticateJWT,
  authorizeRoles('buyer', 'farmer', 'admin'),
  getFavorites
);

router.post(
  '/favorites',
  authenticateJWT,
  authorizeRoles('buyer', 'farmer', 'admin'),
  validateRequest(
    Joi.object({
      userId: Joi.string().required(),
      listingId: Joi.string().required(),
    })
  ),
  addToFavorites
);

router.delete(
  '/favorites/:userId/:listingId',
  authenticateJWT,
  authorizeRoles('buyer', 'farmer', 'admin'),
  removeFromFavorites
);

// Cloudinary image upload
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'grochain-listings',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  } as any,
});
const upload = multer({ storage });

router.post('/upload-image', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), upload.array('images', 5), (req, res) => {
  // @ts-ignore
  const files = req.files as Express.Multer.File[];
  const urls = files.map(file => file.path);
  res.status(201).json({ status: 'success', urls });
});

export default router;
