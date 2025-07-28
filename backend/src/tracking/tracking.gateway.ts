import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

interface TrackingRoom {
  trackingNumber: string;
  clients: Set<string>;
}

@WebSocketGateway({
  cors: {
    origin: "http://localhost:4200", // Your frontend URL
    credentials: true
  }
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private trackingRooms: Map<string, TrackingRoom> = new Map();

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinTracking')
  handleJoinTracking(
    @MessageBody() data: { trackingNumber: string },
    @ConnectedSocket() client: Socket
  ) {
    const { trackingNumber } = data;
    
    // Join the tracking room
    client.join(`tracking_${trackingNumber}`);
    
    // Track room membership
    if (!this.trackingRooms.has(trackingNumber)) {
      this.trackingRooms.set(trackingNumber, {
        trackingNumber,
        clients: new Set()
      });
    }
    
    this.trackingRooms.get(trackingNumber)!.clients.add(client.id);
    
    console.log(`Client ${client.id} joined tracking room for ${trackingNumber}`);
    
    return { success: true, message: `Joined tracking room for ${trackingNumber}` };
  }

  @SubscribeMessage('leaveTracking')
  handleLeaveTracking(
    @MessageBody() data: { trackingNumber: string },
    @ConnectedSocket() client: Socket
  ) {
    const { trackingNumber } = data;
    
    // Leave the tracking room
    client.leave(`tracking_${trackingNumber}`);
    
    // Remove from room tracking
    const room = this.trackingRooms.get(trackingNumber);
    if (room) {
      room.clients.delete(client.id);
      if (room.clients.size === 0) {
        this.trackingRooms.delete(trackingNumber);
      }
    }
    
    console.log(`Client ${client.id} left tracking room for ${trackingNumber}`);
    
    return { success: true, message: `Left tracking room for ${trackingNumber}` };
  }

  // Method to emit location updates to all clients tracking a parcel
  emitLocationUpdate(trackingNumber: string, locationData: any) {
    this.server.to(`tracking_${trackingNumber}`).emit('locationUpdate', {
      trackingNumber,
      ...locationData,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Emitted location update for ${trackingNumber} to ${this.trackingRooms.get(trackingNumber)?.clients.size || 0} clients`);
  }

  // Method to emit status updates
  emitStatusUpdate(trackingNumber: string, statusData: any) {
    this.server.to(`tracking_${trackingNumber}`).emit('statusUpdate', {
      trackingNumber,
      ...statusData,
      timestamp: new Date().toISOString()
    });
  }

  // Method to emit ETA updates
  emitETAUpdate(trackingNumber: string, etaData: any) {
    this.server.to(`tracking_${trackingNumber}`).emit('etaUpdate', {
      trackingNumber,
      ...etaData,
      timestamp: new Date().toISOString()
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Clean up room memberships
    for (const [trackingNumber, room] of this.trackingRooms.entries()) {
      if (room.clients.has(client.id)) {
        room.clients.delete(client.id);
        if (room.clients.size === 0) {
          this.trackingRooms.delete(trackingNumber);
        }
      }
    }
  }

  // Get active tracking rooms (for debugging)
  getActiveRooms() {
    return Array.from(this.trackingRooms.values()).map(room => ({
      trackingNumber: room.trackingNumber,
      clientCount: room.clients.size
    }));
  }
} 