import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { webSocketService } from '../services/websocket.service';

const router = Router();

// WebSocket connection status endpoint
router.get('/status', authenticateJWT, (req, res) => {
  const connectedClients = webSocketService.getConnectedClientsCount();
  res.json({
    status: 'success',
    data: {
      connectedClients,
      websocketEnabled: true
    }
  });
});

// Send real-time notification to specific user
router.post('/notify-user', authenticateJWT, (req, res) => {
  try {
    const { userId, event, data } = req.body;
    
    if (!userId || !event) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and event are required'
      });
    }

    webSocketService.sendToUser(userId, event, data);
    
    res.json({
      status: 'success',
      message: `Real-time notification sent to user ${userId}`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send real-time notification'
    });
  }
});

// Send real-time notification to partner network
router.post('/notify-partner-network', authenticateJWT, (req, res) => {
  try {
    const { partnerId, event, data } = req.body;
    
    if (!partnerId || !event) {
      return res.status(400).json({
        status: 'error',
        message: 'partnerId and event are required'
      });
    }

    webSocketService.sendToPartnerNetwork(partnerId, event, data);
    
    res.json({
      status: 'success',
      message: `Real-time notification sent to partner network ${partnerId}`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send real-time notification'
    });
  }
});

export default router;
