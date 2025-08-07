import { Router } from 'express';
import { getListings, createListing, createOrder, updateOrderStatus } from '../controllers/marketplace.controller';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.util';

const router = Router();

router.get('/listings', getListings);
router.post('/listings', createListing);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Cloudinary image upload
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'grochain-listings',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

router.post('/upload-image', upload.array('images', 5), (req, res) => {
  // @ts-ignore
  const files = req.files as Express.Multer.File[];
  const urls = files.map(file => file.path);
  res.status(201).json({ status: 'success', urls });
});

export default router;
