import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMediaData } from './model/create-media';
import { Media } from './model/media';
import { Media as PrismaMedia } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(resourceId: number): Promise<Media> {
    const media = await this.prisma.media.findUnique({
      where: { id: resourceId },
    });
    if (!media) {
      throw new BadRequestException('Media Not found');
    }

    return this.toMedia(media);
  }

  async saveMedia(media: CreateMediaData): Promise<Media> {
    const response = await this.prisma.media.create({
      data: { ...media },
    });
    return this.toMedia(response);
  }
  async softDeleteMedia(resourceId: number): Promise<void> {
    const response = await this.prisma.media.update({
      where: { id: resourceId },
      data: { deletedAt: new Date() },
    });
  }

  private toMedia(media: PrismaMedia): Media {
    return {
      id: media.id,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      uploadedById: media.uploadedById,
      url: media.url,
      name: media.name,
      storageKey: media.storageKey,
      size: media.size,
      deletedAt: media.deletedAt,
      mimeType: media.mimeType,
    };
  }
}
