import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JWTParserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['jwt'] = req.headers?.authorization?.split(' ')?.[1];
    next();
  }
}
