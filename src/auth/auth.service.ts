import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthRepository } from './auth.repository';
import { LoginUserDto } from './dto/login-user.dto';
import * as argon2 from 'argon2';
import { LoginResponse } from './models/login-response';
import { User } from './models/auth';
import { TokenService } from './token.service';
import { TokenModel } from './models/token';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { RefreshTokenDto } from './dto/refreshToken.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}
  registerUser(registerUserData: CreateUserDto) {
    return this.authRepository.create(registerUserData);
  }
  async loginUser(loginUserData: LoginUserDto): Promise<LoginResponse> {
    if (!(await this.authRepository.isUserExist(loginUserData.email))) {
      throw new UserNotFoundException();
    }

    const userData = await this.authRepository.getUserDataByEmail(
      loginUserData.email,
    );

    const passwordValid = await argon2.verify(
      userData.passwordHash,
      loginUserData.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Email or Password not found!');
    }

    const { accessToken, refreshToken } = await this.issueTokenPair(userData);

    const { passwordHash, ...user } = userData;

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
  async refresh(refreshToken: string): Promise<TokenModel> {
    const data = await this.tokenService.verifyRefreshToken(refreshToken);

    const tokenHash = this.tokenService.hashToken(refreshToken);

    const storedToken = await this.authRepository.findRefreshToken(
      data.sub,
      tokenHash,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userData = await this.authRepository.getUserDataById(data.sub);

    await this.authRepository.deleteRefreshToken(storedToken.id);

    return this.issueTokenPair(userData);
  }
  async getUserProfile(userEmail: string): Promise<User> {
    if (!(await this.authRepository.isUserExist(userEmail))) {
      throw new UserNotFoundException();
    }
    const userData = await this.authRepository.getUserDataByEmail(userEmail);

    return this.authRepository.toModel(userData);
  }

  async logout(refreshToken: string): Promise<boolean> {
    const tokenHash = this.tokenService.hashToken(refreshToken);

    await this.authRepository.revokeRefreshToken(tokenHash);

    return true;
  }

  private async issueTokenPair(userData: User): Promise<TokenModel> {
    const payload = {
      sub: userData.id,
      email: userData.email,
      role: userData.roleId,
    };

    const accessToken = await this.tokenService.generateTokens(payload);

    const refreshToken = await this.tokenService.generateRefreshTokens(
      userData.id,
    );

    const tokenHash = this.tokenService.hashToken(refreshToken);

    const refreshDays = Number(process.env.JWT_REFRESH_EXPIRES_DAYS);

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.authRepository.removeExpiredRefreshTokens(userData.id);

    await this.authRepository.saveRefreshToken(
      userData.id,
      tokenHash,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
