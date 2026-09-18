import { Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthRole, AuthStatus, User } from './models/auth';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    const role = await this.prisma.role.findUnique({
      where: {
        name: 'USER',
      },
    });

    if (!role) {
      throw new Error('Default USER role not found');
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await this.prisma.user.create({
      data: {
        userName: data.email,
        email: data.email,
        passwordHash,

        roleId: role.id,

        detail: {
          create: {
            name: data.name,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            address: data.address,
          },
        },
      },
    });

    return this.toModel(user);
  }

  async isUserExist(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    return !!user;
  }

  async getUserDataByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        status: 'ENABLED',
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toModel(user);
  }

  async getUserDataById(id: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
        status: 'ENABLED',
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toModel(user);
  }

  async saveRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findRefreshToken(userId: number, tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash,
        revokedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async deleteRefreshToken(id: number): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: {
        id,
      },
    });
  }
  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async removeExpiredRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,

        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  toModel(user: {
    id: number;
    userName: string;
    email: string;
    passwordHash: string;
    roleId: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): User {
    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      passwordHash: user.passwordHash,
      roleId: user.roleId as AuthRole,
      status: user.status as AuthStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
