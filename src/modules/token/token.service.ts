import { CreateMeetingDto } from './../meeting/dto/create-meeting.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as moment from 'moment-timezone';
import * as jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';

import { UserRepository } from './../user/user.repository';
import { User } from '../user/schemas/user.schema';
import { GeneratedTokenReturnDto } from './dto/generated-token-return.dto';
import { TokenType } from 'src/types/config.type';
import { TokenRepository } from './token.repository';
import { JWTDecodeDto } from './dto/jwt-decoded.dto';
import { Moment } from 'moment-timezone';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokenRepository,
    private readonly userRepository: UserRepository,
  ) {}

  generateHash(payload: any): string {
    const secret = this.configService.get('PRIVATE_KEY');

    const hmac = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return hmac;
  }

  async generateAuthToken(user: User): Promise<GeneratedTokenReturnDto> {
    const payload = {
      iat: moment.utc().valueOf(),
      sub: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      user_meta: user.user_meta,
      email: user.email,
      roles: user.role,
      created_at: user.created_at,
    };
    const refreshToken = this.generateRefreshToken(payload);
    const accessToken = this.generateAccessToken({ payload });
    // save the refresh token for validating the token and generating new acccess token
    await this.tokenRepository.saveRefreshToken(refreshToken, user);
    return {
      accessToken,
      refreshToken,
    };
  }

  async generateAuthMeeting(
    createMeetingDto: CreateMeetingDto & {
      newExp: Moment;
      _id: string;
      user_identifier: string;
    },
  ) {
    const payload = {
      _id: createMeetingDto._id,
      iat: moment.utc().valueOf(),
      ...createMeetingDto,
    };
    return this.generateAccessToken({
      payload,
      key: 'meeting',
      newExp: createMeetingDto.newExp,
    });
  }

  verifyToken(token: string) {
    return jwt.verify(token, this.configService.get('PUBLIC_KEY'), {
      clockTimestamp: moment.utc().valueOf(),
    });
  }

  async validateAccessToken(
    headers: string,
  ): Promise<JWTDecodeDto | undefined> {
    const token = headers?.split(' ')?.[1];
    try {
      const isValid = this.verifyToken(token);
      if (isValid) {
        const decoded: JWTDecodeDto = jwtDecode(token);
        const user = await this.userRepository.getById(decoded.sub);
        return user ? decoded : undefined;
      }
    } catch (error) {
      throw new HttpException(
        'access token is not valid',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async validateRefreshToken(
    headers: string, // : Promise<Partial<GeneratedTokenReturnDto>>
  ) {
    const token = headers?.split(' ')?.[1];
    try {
      const hashed_token = crypto
        .createHmac('sha256', this.configService.get('PRIVATE_KEY'))
        .update(token)
        .digest('hex');
      const isFound = await this.tokenRepository.findByHashed(hashed_token);
      if (isFound) {
        const isValid = this.verifyToken(token);
        if (!isValid) {
          throw { message: 'Error: JWT expired' };
        }
        const decoded: JWTDecodeDto = jwtDecode(token);
        const user = await this.userRepository.getById(decoded?.sub);
        if (user) {
          // generate new access token
          const payload = {
            iat: moment.utc().valueOf(),
            sub: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            roles: user.role,
            created_at: user.created_at,
          };
          const accessToken = this.generateAccessToken({ payload });
          return { accessToken };
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'refresh token is not valid, either expired or really invalid',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  generateAccessToken({
    payload,
    key = 'access',
    newExp,
  }: {
    payload: any;
    key?: string;
    newExp?: Moment;
  }): string {
    const { exp }: TokenType = this.configService.get('token');
    const configExp = exp[key];

    let accessTokenExp = newExp || moment.utc();

    if (!newExp) {
      accessTokenExp = accessTokenExp.add({
        months: configExp.months,
        days: configExp.days,
        hours: configExp.hours,
        minutes: configExp.minutes,
        seconds: configExp.seconds,
      });
    }

    const accessToken = jwt.sign(
      payload,
      this.configService.get('PRIVATE_KEY'),
      {
        algorithm: 'RS256',
        expiresIn: accessTokenExp.diff(moment.utc(), 'milliseconds'),
      },
    );
    return accessToken;
  }

  generateRefreshToken(payload): string {
    const {
      exp: { refresh: configRefresh },
    }: TokenType = this.configService.get('token');

    let refreshTokenExp = moment.utc();
    refreshTokenExp = refreshTokenExp.add({
      months: configRefresh.months,
      days: configRefresh.days,
      hours: configRefresh.hours,
      minutes: configRefresh.minutes,
      seconds: configRefresh.seconds,
    });

    const refreshToken = jwt.sign(
      payload,
      this.configService.get('PRIVATE_KEY'),
      {
        algorithm: 'RS256',
        expiresIn: refreshTokenExp.diff(moment.utc(), 'milliseconds'),
      },
    );

    return refreshToken;
  }
}
