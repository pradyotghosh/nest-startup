import { Injectable } from '@nestjs/common';
import { StorageProvider, SaveOptions, SaveResult } from './storage.interface';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorage implements StorageProvider {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR ?? './uploads';
    this.baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
  }

  async save(
    file: Express.Multer.File,
    options?: SaveOptions,
  ): Promise<SaveResult> {
    const extension = extname(file.originalname);
    const filename = options?.filename || `${uuidv4()}${extension}`;
    const folder = options?.folder || 'files';

    const dirPath = join(this.uploadDir, folder);
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = join(dirPath, filename);
    await fs.writeFile(filePath, file.buffer);

    // Return standardized result
    const identifier = `${folder}/${filename}`;
    return {
      identifier,
      url: `${this.baseUrl}/uploads/${identifier}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async get(identifier: string): Promise<Buffer> {
    const filePath = join(this.uploadDir, identifier);
    return fs.readFile(filePath);
  }

  async delete(identifier: string): Promise<void> {
    const filePath = join(this.uploadDir, identifier);
    await fs.unlink(filePath);
  }

  async getUrl(identifier: string): Promise<string> {
    return `${this.baseUrl}/uploads/${identifier}`;
  }
}
