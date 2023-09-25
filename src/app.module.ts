import { TokenController } from './modules/token/token.controller';
import { UserController } from './modules/user/user.controller';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TokenModule } from './modules/token/token.module';
import { JWTParserMiddleware } from './middlewares/JWTParser.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingModule } from './modules/meeting/meeting.module';
import { MeetingController } from './modules/meeting/meeting.controller';
import configuration from './configurations/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TokenModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const database = await configService.get('database');
        return { uri: database.host };
      },
      inject: [ConfigService],
    }),
    MeetingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JWTParserMiddleware)
      .exclude({ path: 'users/authenticate', method: RequestMethod.POST })
      .forRoutes(UserController, TokenController, MeetingController);
  }
}
