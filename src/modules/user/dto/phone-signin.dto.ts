import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneSigninDto {
  @IsNotEmpty()
  @IsString()
  phone_number: string;
}
