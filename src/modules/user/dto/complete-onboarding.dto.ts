import { IsOptional, IsString } from 'class-validator';

export class OnBoardingDataDto {
  @IsString()
  @IsOptional()
  phone_number: string | null;

  @IsString()
  formatted_phone_number: string;

  @IsString()
  code: string;

  user_data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
  };
}
