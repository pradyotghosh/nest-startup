export interface StorageProvider {
  save(file: Express.Multer.File, options?: SaveOptions): Promise<SaveResult>;

  get(identifier: string): Promise<Buffer>;

  delete(identifier: string): Promise<void>;

  getUrl(identifier: string, expiresIn?: number): Promise<string>;
}

export interface SaveOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface SaveResult {
  identifier: string;
  url: string;
  size: number;
  mimeType: string;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
