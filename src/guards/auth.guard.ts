import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenService } from 'src/modules/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.jwt;
    if (token) {
      try {
        const verify = this.tokenService.verifyToken(token);
        if (!!verify) {
          request.currentUser = verify;
          return true;
        }
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}
