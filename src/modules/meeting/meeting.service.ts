import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { TokenService } from '../token/token.service';
import { TokenRepository } from '../token/token.repository';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Meeting } from './schemas/meeting.schema';
import { JoinMeetingDto, ValidateSessionDto } from './dto/meetings.dto';
import { UserRepository } from '../user/user.repository';
import { User } from '../user/schemas/user.schema';
import * as moment from 'moment-timezone';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class MeetingService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    @InjectModel('Meeting') private meetingModel: Model<Meeting>,
    private readonly userRepository: UserRepository,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createMeetingDto: CreateMeetingDto): Promise<string> {
    await this.deleteExpiredMeeting();
    let creator: User | undefined = undefined;

    if (!!createMeetingDto.creator_id) {
      creator = await this.userRepository.getById(
        createMeetingDto.creator_id,
        false,
      );
    }

    const user_identifier = creator
      ? `${creator.first_name} ${creator.last_name}`
      : `LUID-${this.generateRandomString(5)}`;

    const exp = moment.utc().add({ days: 1 });
    const meeting = new this.meetingModel({
      creator,
      password: createMeetingDto.password,
      meeting_id: createMeetingDto.meeting_id,
      participant: 0,
      created_at: moment.utc().toDate(),
      expired_at: exp,
      user_identifier,
    });
    await meeting.save();
    return this.tokenService.generateAuthMeeting({
      ...createMeetingDto,
      newExp: exp,
      user_identifier,
      _id: meeting._id,
    });
  }

  async join(joinMeetingDto: JoinMeetingDto): Promise<string | boolean> {
    await this.deleteExpiredMeeting();
    const meeting = await this.meetingModel
      .findOne({
        password: joinMeetingDto.password,
        meeting_id: joinMeetingDto.meeting_id,
      })
      .lean();
    if (!!meeting) {
      let joiner;

      if (joinMeetingDto.joiner_id) {
        joiner = await this.userRepository.getById(
          joinMeetingDto.joiner_id,
          false,
        );
      }
      const exp = moment.utc().add({ days: 1 });
      const payload = {
        newExp: exp,
        _id: meeting._id,
        iat: moment.utc().valueOf(),
        user_identifier: joiner
          ? `${joiner.first_name} ${joiner.last_name}`
          : `LUID-${this.generateRandomString(5)}`,
      };

      return this.tokenService.generateAccessToken({ payload, key: 'meeting' });
    }
    return false;
  }

  async validateSession(
    sessionDto: ValidateSessionDto,
  ): Promise<boolean | Meeting> {
    await this.deleteExpiredMeeting();
    const result = this.tokenService.verifyToken(sessionDto.session);

    if (!!result) {
      let joiner;
      const res = await this.meetingModel
        .findOne({
          _id: (result as JwtPayload)._id,
          expired_at: { $gt: moment.utc().toDate() },
        })
        .lean();

      if (sessionDto.joiner_id) {
        joiner = await this.userRepository.getById(sessionDto.joiner_id, false);
      }

      return res
        ? res.meeting_id == sessionDto.meeting_sid
          ? {
              ...res,
              user_identifier:
                (joiner && `${joiner.first_name} ${joiner.last_name}`) ||
                (result as JwtPayload).user_identifier ||
                `LUID-${this.generateRandomString(5)}`,
            }
          : false
        : false;
    }

    return false;
  }

  deleteExpiredMeeting() {
    return this.meetingModel
      .find({
        expired_at: { $lt: moment.utc().toDate() },
      })
      .deleteMany();
  }

  findAll() {
    return `This action returns all meeting`;
  }

  findOne(id: number) {
    return `This action returns a #${id} meeting`;
  }

  update(id: number, updateMeetingDto: UpdateMeetingDto) {
    return `This action updates a #${id} meeting`;
  }

  remove(id: number) {
    return `This action removes a #${id} meeting`;
  }

  generateRandomString(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
