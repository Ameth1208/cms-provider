import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    const orgId = client.handshake.query.organizationId as string
    if (orgId) {
      client.join(`org:${orgId}`)
    }
  }

  handleDisconnect() {}

  emitOrderCreated(order: any) {
    this.server.to(`org:${order.organizationId}`).emit('order.created', order)
  }

  emitOrderStatus(order: any) {
    this.server.to(`org:${order.organizationId}`).emit('order.status', order)
  }
}
