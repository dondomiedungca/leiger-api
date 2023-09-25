import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidateSessionDto {
  @IsNotEmpty()
  @IsString()
  session: string;

  @IsOptional()
  @IsString()
  meeting_sid: string;

  @IsOptional()
  @IsString()
  joiner_id?: string;
}

export class JoinMeetingDto {
  @IsNotEmpty()
  @IsString()
  meeting_id: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  joiner_id?: string;
}
