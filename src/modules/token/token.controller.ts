import { Controller, Post, Headers } from '@nestjs/common';
import { TokenService } from './token.service';
import { User } from '../user/schemas/user.schema';
import { GeneratedTokenReturnDto } from './dto/generated-token-return.dto';
import { JWTDecodeDto } from './dto/jwt-decoded.dto';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('/validate-access-token')
  validateAccessToken(
    @Headers('authorization') headers,
  ): Promise<JWTDecodeDto | undefined> {
    return this.tokenService.validateAccessToken(headers);
  }

  @Post('/refresh-token')
  refreshToken(
    @Headers('authorization') headers,
  ): Promise<Partial<GeneratedTokenReturnDto>> {
    return this.tokenService.validateRefreshToken(headers);
  }
}
