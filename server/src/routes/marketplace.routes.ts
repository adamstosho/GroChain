import { Router } from 'express';
import { getListings, createListing, createOrder, updateOrderStatus, getSearchSuggestions } from '../controllers/marketplace.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.util';

const router = Router();

router.get('/listings', getListings);
router.get('/search-suggestions', getSearchSuggestions);
router.post('/listings', authenticateJWT, authorizeRoles('farmer', 'partner', 'admin'), createListing);
router.post('/orders', authenticateJWT, authorizeRoles('buyer', 'farmer', 'partner', 'admin'), createOrder);
router.patch('/orders/:id/status', authenticateJWT, authorizeRoles('partner', 'aggregator', 'admin'), updateOrderStatus);

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
