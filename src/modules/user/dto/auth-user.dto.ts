import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class AuthUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class CheckEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class AuthReturnDto {
  accessToken: string;
  refreshToken: string;
}

export class UserFindByIdDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
