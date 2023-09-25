import { Global, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { TokenRepository } from './token.repository';
import { TokenSchema } from './schemas/token.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivationSchema } from './schemas/activation.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Token', schema: TokenSchema },
      { name: 'Activation', schema: ActivationSchema },
    ]),
  ],
  controllers: [TokenController],
  providers: [TokenService, TokenRepository],
  exports: [TokenService, TokenRepository],
})
export class TokenModule {}
