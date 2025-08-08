import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';

export const sendSMS = async (phone: string, message: string) => {
  // TODO: Integrate with SMS gateway (Twilio, local provider, etc.)
  console.log(`SMS to ${phone}: ${message}`);
  return { success: true };
};

export const sendEmail = async (email: string, subject: string, message: string) => {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`Email to ${email}: ${subject} - ${message}`);
  return { success: true };
};

export const sendUSSD = async (phone: string, message: string) => {
  // TODO: Integrate with USSD gateway
  console.log(`USSD to ${phone}: ${message}`);
  return { success: true };
};

export const sendNotification = async (userId: string, type: 'sms' | 'email' | 'ussd', message: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const notification = new Notification({
      user: userId,
      type,
      message,
      status: 'pending',
    });

    let result;
    switch (type) {
      case 'sms':
        result = await sendSMS(user.phone, message);
        break;
      case 'email':
        result = await sendEmail(user.email, 'GroChain Notification', message);
        break;
      case 'ussd':
        result = await sendUSSD(user.phone, message);
        break;
      default:
        throw new Error('Invalid notification type');
    }

    notification.status = result.success ? 'sent' : 'failed';
    await notification.save();

    return { success: result.success, notification };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: error.message };
  }
};
