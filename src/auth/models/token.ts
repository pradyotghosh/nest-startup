import { AuthRole } from "./auth";

export class TokenModel {
  refreshToken!: string;
  accessToken!: string;
}
export type TokenPayLoad = {
  sub: number;
  email: string;
  role: AuthRole;
};
