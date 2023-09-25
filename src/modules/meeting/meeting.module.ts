import { Global, Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/schemas/user.schema';
import { MeetingSchema } from './schemas/meeting.schema';
import { MeetingGateway } from './meeting.gateway';

@Global()
@Module({
  controllers: [MeetingController],
  providers: [MeetingService, MeetingGateway],
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Meeting', schema: MeetingSchema },
    ]),
  ],
  exports: [MeetingService],
})
export class MeetingModule {}
