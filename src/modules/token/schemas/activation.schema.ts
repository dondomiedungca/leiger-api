import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/modules/user/schemas/user.schema';

export type ActivationDocument = HydratedDocument<Activation>;

@Schema()
export class Activation {
  _id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  email: string;

  @Prop()
  hash: string;

  @Prop()
  phone_number: string;

  @Prop()
  code: number;
}

export const ActivationSchema = SchemaFactory.createForClass(Activation);
