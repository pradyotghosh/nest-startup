export interface ProfileMedia {
  id: number;
  url: string;
  name: string | null;
}
export interface UserProfile {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string | null;
  phoneNumber: string | null;
  address: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: ProfileMedia | null;
  role: string | null;
}
