import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from './role.schema';
import { Activation } from 'src/modules/token/schemas/activation.schema';
import { Exclude } from 'class-transformer';

export type UserDocument = HydratedDocument<User>;

export interface UserActivity {
  show_activity?: boolean;
  is_active?: boolean;
  last_active?: Date;
}

export class UserMeta {
  google_id?: string;
  profile_photo?: string;
  activity?: UserActivity;
}

@Schema()
export class User {
  _id: string;

  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  email: string;

  @Prop({ type: raw(UserMeta) })
  user_meta: Record<string, any>;

  @Prop({ select: false })
  password: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;

  @Prop()
  verified_at: Date;

  @Prop()
  deleted_at: Date;

  @Prop()
  is_deleted: boolean;

  @Prop({ types: mongoose.Schema.Types.ObjectId, ref: 'Activation' })
  activation: Activation;

  @Prop({ types: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
