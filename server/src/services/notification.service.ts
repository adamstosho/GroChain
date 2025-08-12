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

// Notification preferences interface
export interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  ussd: boolean;
  push: boolean;
  marketing: boolean;
  transaction: boolean;
  harvest: boolean;
  marketplace: boolean;
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sms: true,
  email: true,
  ussd: false,
  push: false,
  marketing: true,
  transaction: true,
  harvest: true,
  marketplace: true
};

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

export const sendUSSD = async (phone: string, message: string, sessionId?: string) => {
  try {
    const url = process.env.USSD_GATEWAY_URL;
    const apiKey = process.env.USSD_API_KEY;
    
    if (!url || !apiKey) {
      console.log(`USSD to ${phone}: ${message} (USSD not configured)`);
      return { success: true, message: 'USSD logged (not configured)' };
    }

    // Enhanced USSD payload with session management
    const payload = {
      phone: phone,
      message: message,
      sessionId: sessionId || `grochain_${Date.now()}`,
      timestamp: new Date().toISOString(),
      platform: 'GroChain'
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'GroChain-USSD-Gateway/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const result = await res.json();
      return { 
        success: true, 
        sessionId: result.sessionId || payload.sessionId,
        response: result
      };
    }
    
    const errText = await res.text();
    return { success: false, error: errText };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const sendPushNotification = async (userId: string, title: string, body: string, data?: any) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushToken) {
      return { success: false, error: 'User not found or no push token' };
    }

    const pushToken = user.pushToken;
    const fcmKey = process.env.FCM_SERVER_KEY;
    
    if (!fcmKey) {
      console.log(`Push notification to ${userId}: ${title} - ${body} (FCM not configured)`);
      return { success: true, message: 'Push notification logged (FCM not configured)' };
    }

    const message = {
      to: pushToken,
      notification: {
        title: title,
        body: body,
        icon: '/icon-192x192.png',
        badge: '1'
      },
      data: data || {},
      priority: 'high'
    };

    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (res.ok) {
      const result = await res.json();
      return { success: true, messageId: result.message_id };
    }

    const errText = await res.text();
    return { success: false, error: errText };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const sendNotification = async (
  userId: string, 
  type: 'sms' | 'email' | 'ussd' | 'push', 
  message: string,
  title?: string,
  data?: any,
  category?: string
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check user notification preferences
    const preferences = user.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
    
    // Check if this type of notification is enabled for the user
    if (!preferences[type as keyof NotificationPreferences]) {
      return { success: false, error: `${type} notifications are disabled for this user` };
    }

    // Check category preferences
    if (category && !preferences[category as keyof NotificationPreferences]) {
      return { success: false, error: `${category} notifications are disabled for this user` };
    }

    const notification = new Notification({
      user: userId,
      type,
      message,
      title: title || 'GroChain Notification',
      category: category || 'general',
      status: 'pending',
      metadata: data || {},
      createdAt: new Date()
    });

    let result;
    switch (type) {
      case 'sms':
        result = await sendSMS(user.phone, message);
        break;
      case 'email':
        result = await sendEmail(user.email, title || 'GroChain Notification', message);
        break;
      case 'ussd':
        result = await sendUSSD(user.phone, message);
        break;
      case 'push':
        result = await sendPushNotification(userId, title || 'GroChain', message, data);
        break;
      default:
        throw new Error('Invalid notification type');
    }

    notification.status = result.success ? 'sent' : 'failed';
    (notification as any).metadata = { ...(notification as any).metadata, result };
    await notification.save();

    return { success: result.success, notification, result };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Enhanced bulk SMS invitations with retry logic
export const sendBulkSMSInvitations = async (farmers: Array<{ phone: string; email: string; name: string }>) => {
  const results = [];
  const maxRetries = 3;
  
  for (const farmer of farmers) {
    let retryCount = 0;
    let result;
    
    while (retryCount < maxRetries) {
      const message = `Hello ${farmer.name}! Welcome to GroChain. Your account has been created with email: ${farmer.email}. Download our app to get started with digital farming.`;
      
      result = await sendSMS(farmer.phone, message);
      
      if (result.success) {
        break; // Success, no need to retry
      }
      
      retryCount++;
      if (retryCount < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    results.push({
      phone: farmer.phone,
      email: farmer.email,
      success: result?.success || false,
      error: result?.error || 'Unknown error',
      retries: retryCount
    });
  }
  
  return results;
};

// Bulk notification sender with preferences checking
export const sendBulkNotifications = async (
  userIds: string[],
  type: 'sms' | 'email' | 'ussd' | 'push',
  message: string,
  title?: string,
  data?: any,
  category?: string
) => {
  const results = [];
  
  for (const userId of userIds) {
    const result = await sendNotification(userId, type, message, title, data, category);
    results.push({
      userId,
      success: result.success,
      error: result.error
    });
  }
  
  return results;
};

// Get user notification preferences
export const getUserNotificationPreferences = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
};

// Update user notification preferences
export const updateUserNotificationPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.notificationPreferences = {
      ...(user.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES),
      ...preferences
    };
    
    await user.save();
    return { success: true, preferences: user.notificationPreferences };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Send transaction notification
export const sendTransactionNotification = async (
  userId: string,
  transactionType: 'payment' | 'receipt' | 'refund',
  amount: number,
  currency: string = 'NGN',
  reference?: string
) => {
  const messages = {
    payment: `Payment of ${currency} ${amount.toLocaleString()} processed successfully.`,
    receipt: `You received ${currency} ${amount.toLocaleString()} in your GroChain wallet.`,
    refund: `Refund of ${currency} ${amount.toLocaleString()} has been processed.`
  };

  const title = `Transaction ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`;
  const message = messages[transactionType];
  const data = {
    type: 'transaction',
    transactionType,
    amount,
    currency,
    reference,
    timestamp: new Date().toISOString()
  };

  return await sendNotification(userId, 'push', message, title, data, 'transaction');
};

export const sendHarvestNotification = async (
  userId: string,
  cropType: string,
  quantity: number,
  batchId: string
) => {
  const title = 'Harvest Logged Successfully';
  const message = `Your ${cropType} harvest of ${quantity}kg has been logged with batch ID: ${batchId}`;
  const data = {
    type: 'harvest',
    cropType,
    quantity,
    batchId,
    timestamp: new Date().toISOString()
  };

  return await sendNotification(userId, 'push', message, title, data, 'harvest');
};

// Send marketplace notification
export const sendMarketplaceNotification = async (
  userId: string,
  action: 'listing_created' | 'order_received' | 'payment_received',
  details: any
) => {
  const messages = {
    listing_created: 'Your product listing has been created successfully.',
    order_received: 'You have received a new order for your product.',
    payment_received: 'Payment has been received for your product sale.'
  };

  const title = 'Marketplace Update';
  const message = messages[action];
  const data = {
    type: 'marketplace',
    action,
    details,
    timestamp: new Date().toISOString()
  };

  return await sendNotification(userId, 'push', message, title, data, 'marketplace');
};
