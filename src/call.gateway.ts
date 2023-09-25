import { Injectable } from '@nestjs/common/decorators';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'call' })
@Injectable()
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  handleConnection(@ConnectedSocket() socket: Socket) {
    const roomId = socket.handshake.query?.roomId;
    const user_id = socket.handshake.query?.user_id;
    if (roomId !== 'undefined' && roomId !== undefined) {
      socket.join(roomId);
    }
    if (user_id !== 'undefined' && user_id !== undefined) {
      socket.join(`ind#__call__${user_id}`);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {}

  @SubscribeMessage('call-handleOffer')
  public async sendChat(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const user_individual_id = `ind#__call__${data.partnerId}`;
    this.server.to(user_individual_id).emit('call-handleOffer', data);
  }

  @SubscribeMessage('call-manualEnd')
  public async manualEnd(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const user_individual_id = `ind#__call__${data.partnerId}`;
    this.server.to(user_individual_id).emit('call-manualEnd');
  }

  @SubscribeMessage('call-partnerManualEnd')
  public async partnerManualEnd(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.to(data.roomId).emit('call-partnerManualEnd');
  }

  @SubscribeMessage('call-addAnswer')
  public async addAnswer(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.to(data.roomId).emit('call-addAnswer', { answer: data.answer });
  }

  @SubscribeMessage('call-handleIceCandidate')
  public async handleIceCandidate(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    socket
      .to(data.roomId)
      .emit('call-handleIceCandidate', { candidate: data.candidate });
  }
}
