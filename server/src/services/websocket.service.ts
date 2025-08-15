import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class WebSocketService {
  private io: SocketIOServer | null = null;

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join user to their specific room for personalized updates
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Join partner room for partner-specific updates
      socket.on('join-partner-room', (partnerId: string) => {
        socket.join(`partner-${partnerId}`);
        console.log(`Partner ${partnerId} joined their room`);
      });

      // Join farmer room for farmer-specific updates
      socket.on('join-farmer-room', (farmerId: string) => {
        socket.join(`farmer-${farmerId}`);
        console.log(`Farmer ${farmerId} joined their room`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    console.log('WebSocket service initialized');
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit(event, data);
      console.log(`Sent ${event} to user ${userId}`);
    }
  }

  // Send notification to all users in a partner's network
  sendToPartnerNetwork(partnerId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`partner-${partnerId}`).emit(event, data);
      console.log(`Sent ${event} to partner network ${partnerId}`);
    }
  }

  // Send notification to all users in a farmer's network
  sendToFarmerNetwork(farmerId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`farmer-${farmerId}`).emit(event, data);
      console.log(`Sent ${event} to farmer network ${farmerId}`);
    }
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`Broadcasted ${event} to all clients`);
    }
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.io ? this.io.engine.clientsCount : 0;
  }
}

export const webSocketService = new WebSocketService();
