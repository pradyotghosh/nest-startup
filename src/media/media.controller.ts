import {
  Controller,
  Delete,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Express } from 'express';
import 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { Media } from './model/media';
import { AuthRole } from '../auth/models/auth';
import { Action } from '../common/policies/action';
import { MediaPolicy } from './policies/media.policy';
import { Policy } from '../common/decorators/policy.decorator';
import { PolicyGuard } from '../common/guards/policy.guard';
@ApiBearerAuth('JWT-auth')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Policy(MediaPolicy, Action.CREATE, undefined, [
    AuthRole.ADMIN,
    AuthRole.USER,
  ])
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data') //dev
  @ApiBody({
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  }) //dev
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @CurrentUser('sub') userId: number,
  ): Promise<Media> {
    return await this.mediaService.uploadMedia(file, userId);
  }
  @Delete(':id')
  @Policy(MediaPolicy, Action.DELETE, 'id')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  async delete(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.mediaService.delete(id);
  }
}
