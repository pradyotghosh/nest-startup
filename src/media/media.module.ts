import { BadRequestException, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { STORAGE_PROVIDER, StorageProvider } from './storage/storage.interface';
import { ConfigService } from '@nestjs/config';
import { LocalStorage } from './storage/local.storage';
import { MediaRepository } from './media.repository';

@Module({
  imports: [],

  controllers: [MediaController],
  providers: [
    MediaService,
    MediaRepository,
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalStorage,
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
