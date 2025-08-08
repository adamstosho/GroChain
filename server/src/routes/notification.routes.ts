import { Router } from 'express';
import { sendUserNotification, getUserNotifications } from '../controllers/notification.controller';

const router = Router();

router.post('/send', sendUserNotification);
router.get('/:userId', getUserNotifications);

export default router;
