import axios from 'axios';

const AT_USERNAME = process.env.AFRICASTALKING_USERNAME;
const AT_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AT_BASE_URL = 'https://api.africastalking.com/version1';

export const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    if (!AT_USERNAME || !AT_API_KEY) {
      throw new Error('Africastalking credentials not configured');
    }

    const response = await axios.post(
      `${AT_BASE_URL}/messaging`,
      {
        username: AT_USERNAME,
        to: phoneNumber,
        message: message,
        from: 'GroChain'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apiKey': AT_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Africastalking SMS error:', error);
    throw new Error('Failed to send SMS');
  }
};

export const sendUSSD = async (phoneNumber: string, message: string, sessionId: string) => {
  try {
    if (!AT_USERNAME || !AT_API_KEY) {
      throw new Error('Africastalking credentials not configured');
    }

    const response = await axios.post(
      `${AT_BASE_URL}/ussd`,
      {
        username: AT_USERNAME,
        to: phoneNumber,
        message: message,
        sessionId: sessionId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apiKey': AT_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Africastalking USSD error:', error);
    throw new Error('Failed to send USSD message');
  }
};

export const getBalance = async () => {
  try {
    if (!AT_USERNAME || !AT_API_KEY) {
      throw new Error('Africastalking credentials not configured');
    }

    const response = await axios.get(
      `${AT_BASE_URL}/user`,
      {
        params: { username: AT_USERNAME },
        headers: { 'apiKey': AT_API_KEY }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Africastalking balance check error:', error);
    throw new Error('Failed to get balance');
  }
};


