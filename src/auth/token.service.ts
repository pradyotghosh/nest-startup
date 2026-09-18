import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHash } from 'crypto';

import { TokenPayLoad } from './models/token';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: TokenPayLoad) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,

      expiresIn: process.env
        .JWT_ACCESS_EXPIRES_IN as JwtSignOptions['expiresIn'],
    });

    return accessToken;
  }

  async generateRefreshTokens(userId: number) {
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,

        expiresIn: process.env
          .JWT_REFRESH_EXPIRES_IN as JwtSignOptions['expiresIn'],
      },
    );

    return refreshToken;
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
