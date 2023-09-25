import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleSigninDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
