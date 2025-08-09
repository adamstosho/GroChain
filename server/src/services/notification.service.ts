import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import twilio from 'twilio';

// Initialize Twilio client conditionally
let twilioClient: any = null;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

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
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@grochain.ng';
    if (!apiKey) {
      console.log(`Email to ${email}: ${subject} - ${message} (SendGrid not configured)`);
      return { success: true, message: 'Email logged (SendGrid not configured)' };
    }
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: fromEmail },
        subject,
        content: [{ type: 'text/plain', value: message }]
      })
    });
    if (res.ok) return { success: true };
    const errText = await res.text();
    return { success: false, error: errText };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const sendUSSD = async (phone: string, message: string) => {
  try {
    const url = process.env.USSD_GATEWAY_URL;
    const apiKey = process.env.USSD_API_KEY;
    if (!url || !apiKey) {
      console.log(`USSD to ${phone}: ${message} (USSD not configured)`);
      return { success: true, message: 'USSD logged (not configured)' };
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ phone, message })
    });
    if (res.ok) return { success: true };
    const errText = await res.text();
    return { success: false, error: errText };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
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
