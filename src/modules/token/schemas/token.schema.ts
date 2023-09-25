import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/modules/user/schemas/user.schema';

export type TokenDocument = HydratedDocument<Token>;

@Schema()
export class Token {
  _id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  hashed_token: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
