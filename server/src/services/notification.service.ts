import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export const sendSMS = async (phone: string, message: string) => {
  try {
    // Check if Twilio is configured
    if (!TWILIO_PHONE_NUMBER || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`SMS to ${phone}: ${message} (Twilio not configured)`);
      return { success: true, message: 'SMS logged (Twilio not configured)' };
    }

    // Format phone number for Nigeria (+234)
    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '+234' + phone.substring(1);
    } else if (phone.startsWith('234')) {
      formattedPhone = '+' + phone;
    } else if (!phone.startsWith('+')) {
      formattedPhone = '+234' + phone;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`SMS sent successfully to ${formattedPhone}, SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: (error as Error).message };
  }
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
    return { success: false, error: (error as Error).message };
  }
};

// New function for sending bulk SMS invitations
export const sendBulkSMSInvitations = async (farmers: Array<{ phone: string; email: string; name: string }>) => {
  const results = [];
  
  for (const farmer of farmers) {
    const message = `Hello ${farmer.name}! Welcome to GroChain. Your account has been created with email: ${farmer.email}. Download our app to get started with digital farming.`;
    
    const result = await sendSMS(farmer.phone, message);
    results.push({
      phone: farmer.phone,
      email: farmer.email,
      success: result.success,
      error: result.error
    });
  }
  
  return results;
};
