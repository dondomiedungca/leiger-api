import { GoogleSigninDto } from './dto/google-signin.dto';
import {
  AuthReturnDto,
  AuthUserDto,
  CheckEmailDto,
  UserFindByIdDto,
} from './dto/auth-user.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as moment from 'moment-timezone';
import axios from 'axios';

import { User, UserMeta } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { TokenType } from './../../types/config.type';
import { TokenService } from '../token/token.service';
import { TokenRepository } from '../token/token.repository';
import { GeneratedTokenReturnDto } from '../token/dto/generated-token-return.dto';
import { RolesType } from 'src/types/roles.type';
import { JWTDecodeDto } from '../token/dto/jwt-decoded.dto';
import jwtDecode from 'jwt-decode';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Token } from '../token/schemas/token.schema';
import { PhoneSigninDto } from './dto/phone-signin.dto';
import { Activation } from '../token/schemas/activation.schema';
import { TypeVerification, VerifyDto } from './dto/verify.dto';
import { OnBoardingDataDto } from './dto/complete-onboarding.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Activation') private activationModel: Model<Activation>,
    @InjectModel('Token') private tokenModel: Model<Token>,
  ) {}

  async authenticate(
    authUserDto: AuthUserDto, // : Promise<AuthReturnDto>
  ) {
    const attemptedUser = await this.userRepository.findByEmail(
      authUserDto.email,
    );

    if (attemptedUser) {
      if (attemptedUser?.user_meta) {
        if (
          (attemptedUser.user_meta as any)?.google_id ||
          attemptedUser?.activation?.phone_number
        ) {
          throw new HttpException(
            'Incorrect credentials',
            HttpStatus.FORBIDDEN,
          );
        }
      }
      if (!attemptedUser.verified_at) {
        throw new HttpException(
          'User is not yet verified',
          HttpStatus.FORBIDDEN,
        );
      }
      if (attemptedUser.deleted_at) {
        throw new HttpException('User is deleted', HttpStatus.FORBIDDEN);
      }
      const isMatch = await bcrypt.compare(
        authUserDto.password,
        attemptedUser.password,
      );
      if (isMatch) {
        const generatedToken: GeneratedTokenReturnDto =
          await this.tokenService.generateAuthToken(attemptedUser);
        return generatedToken;
      }
    }
    throw new HttpException('Incorrect credentials', HttpStatus.FORBIDDEN);
  }

  async signinWithGoogle(
    { token }: GoogleSigninDto, // : Promise<AuthReturnDto>
  ) {
    const response = await axios.get(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.status === 200) {
      let user;
      const checkUser = await this.userModel
        .findOne({ 'user_meta.google_id': { $eq: response.data.id } })
        .exec();

      if (checkUser) {
        user = checkUser;
      } else {
        const role = await this.userRepository.getRole(RolesType.NORMAL_USER);
        user = new this.userModel({
          first_name: response.data.given_name,
          last_name: response.data.family_name,
          email: response.data.email,
          password: 'test',
          user_meta: {
            activity: {
              show_activity: true,
              last_active: moment.utc().toDate(),
              is_active: true,
            },
            profile_photo: response.data.picture,
            google_id: response.data.id,
          },
          role: role,
          verified_at: moment.utc().toDate(),
          created_at: moment.utc().toDate(),
          updated_at: moment.utc().toDate(),
        });
        user.save();
      }

      const generatedToken: GeneratedTokenReturnDto =
        await this.tokenService.generateAuthToken(user);
      return generatedToken;
    }
    throw new HttpException(
      "Error on getting user's primary google information",
      HttpStatus.FORBIDDEN,
    );
  }

  async signinWithPhone(
    phoneSigninDto: PhoneSigninDto, // : Promise<boolean>
  ) {
    const { phone_number } = phoneSigninDto;
    const checkNumber = await this.activationModel
      .findOne({
        phone_number: phone_number,
      })
      .sort({ phone_number: 'desc' })
      .exec();

    if (!checkNumber) {
      /**
       * Create new activation with new code
       */
      const activation = new this.activationModel();
      activation.phone_number = phone_number;
      activation.code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
      activation.save();

      /**
       * TODO send new sms in here
       */
    } else {
      const newCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
      checkNumber.code = newCode;
      await checkNumber.save();
      /**
       *TODO Now send new sms in here
       */
    }
    return true;
  }

  async verifyCode(
    verifyDto: VerifyDto,
  ): Promise<{ is_verified: boolean; authTokens?: AuthReturnDto }> {
    const { type, email, phone_number, code } = verifyDto;
    const checkVerification = await this.activationModel
      .findOne({
        [type === TypeVerification.EMAIL ? 'email' : 'phone_number']:
          type === TypeVerification.EMAIL ? email : phone_number,
        code,
      })
      .exec();
    if (!checkVerification) {
      return {
        is_verified: false,
      };
    }
    let tokens: AuthReturnDto | undefined = undefined;
    if (checkVerification?.user) {
      tokens = await this.tokenService.generateAuthToken(
        checkVerification.user,
      );
    }
    return {
      is_verified: true,
      authTokens: tokens,
    };
  }

  async handleLogout({ refreshToken }: RefreshTokenDto): Promise<boolean> {
    const token = refreshToken;
    try {
      const hashed_token = crypto
        .createHmac('sha256', this.configService.get('PRIVATE_KEY'))
        .update(token)
        .digest('hex');

      const isFound = await this.tokenRepository.findByHashed(hashed_token);

      if (isFound) {
        const isValid = this.tokenService.verifyToken(token);
        if (!isValid) {
          throw { message: 'Error: JWT expired' };
        }
        const decoded: JWTDecodeDto = jwtDecode(token);
        const user = await this.userRepository.getById(decoded?.sub);

        if (user) {
          const old_meta = user?.user_meta as unknown as UserMeta;
          const new_user_meta = {
            ...(old_meta || {}),
            activity: {
              ...old_meta?.activity,
              last_active: moment.utc().toDate(),
              is_active: false,
            },
          };
          this.userModel.findByIdAndUpdate(user._id, {
            user_meta: new_user_meta,
          });
          this.tokenModel.findOneAndDelete({ user, hashed_token });
          return true;
        }
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'refresh token is not valid, either expired or really invalid',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async completeOnboarding(
    completeOnboardingDto: OnBoardingDataDto,
  ): Promise<{ is_success: boolean; authTokens?: AuthReturnDto }> {
    const activation = await this.activationModel
      .findOne({
        $and: [
          { code: { $eq: completeOnboardingDto.code } },
          {
            $or: [
              { email: completeOnboardingDto.user_data.email },
              { phone_number: completeOnboardingDto.formatted_phone_number },
            ],
          },
        ],
      })
      .exec();

    if (activation) {
      const tokenConfig: TokenType = this.configService.get('token');
      const salt = bcrypt.genSaltSync(tokenConfig.saltRound);
      const hash = bcrypt.hashSync(
        completeOnboardingDto.user_data.password,
        salt,
      );
      const selectedRole = await this.userRepository.getRole('Normal User');
      const checkEmail = await this.userModel
        .findOne({ email: completeOnboardingDto.user_data.email })
        .exec();

      if (checkEmail) {
        throw new HttpException(
          'Email is already exists.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const user = new this.userModel();
      user.first_name = completeOnboardingDto.user_data.first_name;
      user.last_name = completeOnboardingDto.user_data.last_name;
      user.email = completeOnboardingDto.user_data.email;
      user.verified_at = moment.utc().toDate();
      user.role = selectedRole;
      user.password = hash;
      user.user_meta = {
        profile_photo:
          'data:image/png;base64,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',
        activity: {
          show_activity: true,
          last_active: moment.utc().toDate(),
          is_active: true,
        },
      };

      const newUser = await user.save();
      activation.user = user;

      await this.activationModel
        .findByIdAndUpdate(activation._id, { user: newUser })
        .exec();

      const tokens = await this.tokenService.generateAuthToken(user);

      return {
        is_success: true,
        authTokens: tokens,
      };
    }
    return {
      is_success: false,
    };
  }

  async checkEmail(
    checkEmailDto: CheckEmailDto,
  ): Promise<{ is_exists: boolean }> {
    const userCount = await this.userRepository.findByEmail(
      checkEmailDto.email,
    );
    if (!userCount) {
      const checkEmail = await this.activationModel
        .findOne({ email: checkEmailDto.email })
        .sort({ id: 'desc' });

      if (!checkEmail) {
        /**
         * Create new activation with new code
         */
        const activation = new this.activationModel();
        activation.email = checkEmailDto.email;
        activation.code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        await activation.save();
        /**
         * TODO send new email in here
         */
      }
    }
    return {
      is_exists: !!userCount,
    };
  }

  async userFindById(userFindByIdDto: UserFindByIdDto): Promise<User | null> {
    return this.userRepository.getById(userFindByIdDto.user_id);
  }
}
