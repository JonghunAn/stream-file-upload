import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ContextType,
  BadRequestException,
} from '@nestjs/common';
import { verifyJWS } from '../util/jws.util';
import { isExpired } from '../util/util';
@Injectable()
export class JWSGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const protocol: ContextType = context.getType();
    let jws;

    if (protocol === 'http') {
      const request = context.switchToHttp().getRequest();
      jws = this.getHttpJWS(request);
    } else {
      throw new BadRequestException('not supported protocol request');
    }

    const plainJWS = await verifyJWS(jws);
    let jwsTimestamp = 0;
    if (!jws) {
      throw new UnauthorizedException('Missing JWS');
    }
    try {
      const payload = JSON.parse(plainJWS.payload);
      jwsTimestamp = parseInt(payload.exp);
    } catch (error) {
      throw new UnauthorizedException('Invalid JWS');
    }
    if (isExpired(jwsTimestamp)) {
      throw new UnauthorizedException('Expired JWS');
    }
    return true;
  }

  private getHttpJWS(request: { headers: Record<string, string> }): string {
    const authorization = request.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization Header');
    }
    const [, jws] = authorization.split(' ');
    return jws;
  }
}
