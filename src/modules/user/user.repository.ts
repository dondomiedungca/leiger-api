import { Injectable } from '@nestjs/common';

import { User } from './schemas/user.schema';
import { Role } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Role') private roleModel: Model<Role>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.userModel
      .findOne({ email })
      .sort({ created_at: 'desc' })
      .exec();
  }

  async getById(id: string, asJSON: boolean = true): Promise<User> {
    const result = await this.userModel.findById(id).lean();
    return asJSON ? JSON.parse(JSON.stringify(result)) : result;
  }

  async getRole(name: string): Promise<Role> {
    return this.roleModel
      .findOneAndUpdate(
        { name },
        { name },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }
}
