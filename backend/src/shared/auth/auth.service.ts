import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signIn(id: string, nome: string): Promise<{ access_token: string }> {
    const payload = { sub: id, username: nome };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async extractUserFromAuthHeader(
    request: Request,
  ): Promise<{ id: number; email: string }> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token de autorização não encontrado');
    }

    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      })) as { sub: number; username: string };

      return {
        id: payload.sub,
        email: payload.username,
      };
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
