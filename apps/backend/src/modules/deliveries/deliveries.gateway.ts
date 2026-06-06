import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/deliveries',
})
export class DeliveriesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    const orgId = client.handshake.query.organizationId as string
    const driverId = client.handshake.query.driverId as string
    
    if (orgId) {
      client.join(`org:${orgId}`)
    }
    if (driverId) {
      client.join(`driver:${driverId}`)
    }
  }

  handleDisconnect() {}

  emitDeliveryAssigned(delivery: any) {
    this.server.to(`org:${delivery.order.organizationId}`).emit('delivery.assigned', delivery)
    this.server.to(`driver:${delivery.driverId}`).emit('delivery.assigned', delivery)
  }

  emitDeliveryStarted(delivery: any) {
    this.server.to(`org:${delivery.order.organizationId}`).emit('delivery.started', delivery)
    this.server.to(`driver:${delivery.driverId}`).emit('delivery.started', delivery)
  }

  emitDeliveryNearby(delivery: any) {
    this.server.to(`org:${delivery.order.organizationId}`).emit('delivery.nearby', delivery)
  }

  emitDeliveryCompleted(delivery: any) {
    this.server.to(`org:${delivery.order.organizationId}`).emit('delivery.completed', delivery)
    this.server.to(`driver:${delivery.driverId}`).emit('delivery.completed', delivery)
  }

  emitDeliveryFailed(delivery: any) {
    this.server.to(`org:${delivery.order.organizationId}`).emit('delivery.failed', delivery)
    this.server.to(`driver:${delivery.driverId}`).emit('delivery.failed', delivery)
  }

  emitTrackingUpdate(trackingEvent: any) {
    this.server.to(`org:${trackingEvent.delivery.order.organizationId}`).emit('tracking.update', trackingEvent)
  }
}
