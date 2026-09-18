import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { UserProfile } from './models/users';
import { UpdateUsersDto } from './dto/update-users.dto';
import { PrismaService } from '../prisma/prisma.service';
const userProfileInclude = {
  role: true,

  detail: {
    include: {
      profileImage: true,
    },
  },
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

      include: userProfileInclude,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toModel(user);
  }

  async update(userId: number, changes: UpdateUsersDto): Promise<UserProfile> {
    if (changes.profileImageId !== undefined) {
      const media = await this.prisma.media.findFirst({
        where: {
          id: changes.profileImageId,
          uploadedById: userId,
          deletedAt: null,
        },
      });

      if (!media) {
        throw new BadRequestException('Invalid profile image');
      }
    }
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
        profileImageId: changes.profileImageId,
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
    return {
      id: userData.id,
      name: userData.detail?.name ?? null,
      firstName: userData.detail?.firstName ?? null,
      lastName: userData.detail?.lastName ?? null,
      phoneNumber: userData.detail?.phoneNumber ?? null,
      address: userData.detail?.address ?? null,
      profileImage: userData.detail?.profileImage
        ? {
            id: userData.detail.profileImage.id,
            name: userData.detail.profileImage.name,
            url: userData.detail.profileImage.url,
          }
        : null,
      role: userData.role.name,
      createdAt: userData.createdAt.toISOString(),
      updatedAt: userData.updatedAt.toISOString(),
      deletedAt: userData.deletedAt?.toISOString() ?? null,
    };
  }
}
