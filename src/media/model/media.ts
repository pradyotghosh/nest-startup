export interface Media {
  id: number;
  name: string;
  url: string;
  storageKey: string | null;
  mimeType: string | null;
  size: number | null;
  uploadedById: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
