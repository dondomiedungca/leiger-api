import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/modules/user/schemas/user.schema';

export type MeetingDocument = HydratedDocument<Meeting>;

@Schema()
export class Meeting {
  _id: string;

  @Prop({ types: mongoose.Schema.Types.ObjectId, ref: 'User' })
  creator?: User;

  @Prop()
  user_identifier: string;

  @Prop()
  meeting_id: string;

  @Prop()
  password: string;

  @Prop()
  participant: number;

  @Prop()
  created_at: Date;

  @Prop()
  expired_at: Date;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
