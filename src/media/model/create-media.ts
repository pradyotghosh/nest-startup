export interface CreateMediaData {
  name: string;
  url: string;
  storageKey: string;
  mimeType?: string | null;
  size?: number | null;
  uploadedById: number;
}
