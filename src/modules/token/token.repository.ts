import { Injectable } from '@nestjs/common';

import * as crypto from 'crypto';

import { User } from '../user/schemas/user.schema';
import { Token } from './schemas/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenRepository {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel('Token') private tokenModel: Model<Token>,
  ) {}

  async saveRefreshToken(hash: string, user: User) {
    const hmac = crypto
      .createHmac('sha256', this.configService.get('PRIVATE_KEY'))
      .update(hash)
      .digest('hex');

    return this.tokenModel.findOneAndUpdate(
      { user },
      { hashed_token: hmac },
      { upsert: true, setDefaultsOnInsert: true, new: true },
    );
  }

  async findByHashed(hashed_token: string): Promise<Token> {
    return this.tokenModel.findOne({ hashed_token }).exec();
  }
}
