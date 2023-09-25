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

interface SocketPayload {
  meeting_id: string;
  user_identifier: string;
  socket_id: string;
  payload: any;
  recreate?: boolean;
}

@WebSocketGateway({ cors: true, namespace: 'meeting' })
@Injectable()
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  handleConnection(@ConnectedSocket() socket: Socket) {
    const meeting_id = `meeting_id#__${socket.handshake.query?.meeting_id}`;
    const user_identifier = socket.handshake.query?.user_identifier;
    if (
      socket.handshake.query?.meeting_id !== 'undefined' &&
      socket.handshake.query?.meeting_id !== undefined
    ) {
      socket.join(meeting_id);
      socket
        .to(meeting_id)
        .emit('join', { socket_id: socket.id, user_identifier });
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const meeting_id = `meeting_id#__${socket.handshake.query?.meeting_id}`;
    socket.to(meeting_id).emit('user_leave', { socket_id: socket.id });
  }

  @SubscribeMessage('offer')
  public async offer(
    @MessageBody() data: SocketPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    this.server
      .to(data.socket_id)
      .emit('offer', { ...data, socket_id: socket.id });
  }

  @SubscribeMessage('ice_candidate')
  public async iceCandidate(
    @MessageBody() data: SocketPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    this.server
      .to(data.socket_id)
      .emit('ice_candidate', { ...data, socket_id: socket.id });
  }

  @SubscribeMessage('answer')
  public async answer(
    @MessageBody() data: SocketPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    this.server
      .to(data.socket_id)
      .emit('answer', { ...data, socket_id: socket.id });
  }

  @SubscribeMessage('notify_users_on_toggle')
  public async notifyusersOnToggle(
    @MessageBody() data: SocketPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const meeting_id = `meeting_id#__${data.meeting_id}`;

    socket
      .to(meeting_id)
      .emit('notify_users_on_toggle', { ...data, socket_id: socket.id });
  }

  @SubscribeMessage('shakehand')
  public async shakehand(
    @MessageBody() data: SocketPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const meeting_id = `meeting_id#__${data.meeting_id}`;

    socket.to(meeting_id).emit('shakehand');
  }

  @SubscribeMessage('update_video_canvas')
  public async updateVideoCanvas(
    @MessageBody() data: SocketPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const meeting_id = `meeting_id#__${data.meeting_id}`;

    socket
      .to(meeting_id)
      .emit('update_video_canvas', { ...data, socket_id: socket.id });
  }
}
