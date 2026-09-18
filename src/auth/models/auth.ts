export enum AuthRole {
  ADMIN = 1,
  USER = 2,
  STAFF = 3,
}
export enum AuthStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

export interface User {
  id: number;
  userName: string;
  email: string;
  passwordHash: string;
  roleId: AuthRole;
  status: AuthStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserProfile {
  name: string | null;
  phoneNumber: string | null;
  address: string | null;
  firstName: string | null;
  lastName: string | null;
  profilePhoto: string | null;
  properties: string | null;
  userId: number;
  profileImageId: string | null;
}
