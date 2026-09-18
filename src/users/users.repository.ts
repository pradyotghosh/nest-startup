import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { UserProfile } from './models/users';
import { UpdateUsersDto } from './dto/update-users.dto';
import { PrismaService } from '../prisma/prisma.service';
const userProfileInclude = {
  role: true,
  detail: true,
} satisfies Prisma.UserInclude;

type PrismaUserProfile = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;
@Injectable()
export class UsersRepository {
  logger = new Logger('UsersRepository');
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: number): Promise<UserProfile> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },

      include: {
        role: true,
        detail: true,
        userProfileInclude,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toModel(user);
  }

  async update(userId: number, changes: UpdateUsersDto): Promise<UserProfile> {
    const result = await this.prisma.userDetail.updateMany({
      where: {
        userId,
        deletedAt: null,
      },

      data: {
        name: changes.name,
        firstName: changes.firstName,
        lastName: changes.lastName,
        phoneNumber: changes.phoneNumber,
        address: changes.address,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('User detail not found');
    }

    return this.findById(userId);
  }

  async delete(userId: number): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: {
        id: userId,
        deletedAt: null,
      },

      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('User not found');
    }
  }

  private toModel(userData: PrismaUserProfile): UserProfile {
    // const { mediaLinks, ...propertyWithoutMediaLink } = userData;
    return {
      id: userData.id,
      name: userData.detail?.name ?? null,
      firstName: userData.detail?.firstName ?? null,
      address: userData.detail?.address ?? null,
      createdAt: userData.createdAt.toISOString(),
      updatedAt: userData.updatedAt.toISOString(),
      lastName: userData.detail?.lastName ?? null,
      phoneNumber: userData.detail?.phoneNumber ?? null,
      role: userData.role.name ?? null,
      deletedAt: userData.deletedAt?.toISOString() ?? null,
      // profileImage: userData.detail?.profileImage
      //   ? {
      //       id: userData.detail.profileImage.id,
      //       url: userData.detail.profileImage.url,
      //       name: userData.detail.profileImage.name,
      //     }
      //   : null,
    };
  }
}
