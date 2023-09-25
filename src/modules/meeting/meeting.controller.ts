import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { JoinMeetingDto, ValidateSessionDto } from './dto/meetings.dto';
import { Meeting } from './schemas/meeting.schema';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('create')
  create(@Body() createMeetingDto: CreateMeetingDto): Promise<string> {
    return this.meetingService.create(createMeetingDto);
  }

  @Post('join')
  join(@Body() createMeetingDto: JoinMeetingDto): Promise<string | boolean> {
    return this.meetingService.join(createMeetingDto);
  }

  @Post('/validate-session')
  validateSession(
    @Body() sessionDto: ValidateSessionDto,
  ): Promise<boolean | Meeting> {
    return this.meetingService.validateSession(sessionDto);
  }

  @Get()
  findAll() {
    return this.meetingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingService.update(+id, updateMeetingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingService.remove(+id);
  }
}
