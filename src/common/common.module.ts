// common/common.module.ts

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,

      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],

  providers: [RolesGuard, JwtAuthGuard],

  exports: [RolesGuard, JwtAuthGuard],
})
export class CommonModule {}
