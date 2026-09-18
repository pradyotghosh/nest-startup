import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
@Module({
  imports: [PrismaModule, CommonModule, UsersModule, AuthModule],
})
export class AppModule {}
