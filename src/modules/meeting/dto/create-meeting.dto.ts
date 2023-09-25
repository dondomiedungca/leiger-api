import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsString()
  meeting_id: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  creator_id?: string;
}
