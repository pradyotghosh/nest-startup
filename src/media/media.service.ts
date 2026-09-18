import { Inject, Injectable, Logger } from '@nestjs/common';
import { Media } from './model/media';
import { STORAGE_PROVIDER, StorageProvider } from './storage/storage.interface';
import { MediaRepository } from './media.repository';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,

    private readonly mediaRepository: MediaRepository,
  ) {}

  async uploadMedia(
    upload: Express.Multer.File,
    userId: number,
  ): Promise<Media> {
    const storedFile = await this.storageProvider.save(upload);

    return this.mediaRepository.saveMedia({
      name: upload.originalname,
      url: storedFile.url,
      storageKey: storedFile.identifier,
      mimeType: storedFile.mimeType,
      size: storedFile.size,
      uploadedById: userId,
    });
  }
}
