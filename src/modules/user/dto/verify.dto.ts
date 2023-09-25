import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TypeVerification {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export class VerifyDto {
  @IsString()
  type: TypeVerification;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsNotEmpty()
  code?: string;
}
