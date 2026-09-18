import { User } from "./auth";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, "passwordHash">;
}
