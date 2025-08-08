import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { sendNotification } from '../services/notification.service';
import Joi from 'joi';

const sendNotificationSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid('sms', 'email', 'ussd').required(),
  message: Joi.string().required(),
});

export const sendUserNotification = async (req: Request, res: Response) => {
  try {
    const { error, value } = sendNotificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    const { userId, type, message } = value;
    const result = await sendNotification(userId, type, message);
    if (result.success) {
      return res.status(200).json({ status: 'success', notification: result.notification });
    } else {
      return res.status(500).json({ status: 'error', message: result.error });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', notifications });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};
