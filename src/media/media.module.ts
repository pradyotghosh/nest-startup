import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { STORAGE_PROVIDER } from './storage/storage.interface';
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
