export interface CreateMediaData {
  name: string;
  url: string;
  storageKey?: string | null;
  mimeType?: string | null;
  size?: number | null;
  uploadedById: number;
}
