import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './models/auth';
import { LoginResponse } from './models/login-response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { TokenModel } from './models/token';
export type PublicUser = Omit<User, 'passwordHash'>;

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async createUser(@Body() user: CreateUserDto): Promise<PublicUser> {
    const serviceResponse = await this.authService.registerUser(user);

    const { passwordHash: _, ...publicUser } = serviceResponse;

    return publicUser;
  }

  @Post('login')
  async loginUser(@Body() user: LoginUserDto): Promise<LoginResponse> {
    const serviceResponse = await this.authService.loginUser(user);

    return serviceResponse;
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenModel> {
    return await this.authService.refresh(dto.refreshToken);
  }

  @Post('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() request: Request & { user: JwtPayload },
  ): Promise<PublicUser> {
    const userEmail = request.user.email;
    const { passwordHash: _, ...serviceResponse } =
      await this.authService.getUserProfile(userEmail);

    return serviceResponse;
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<boolean> {
    const result = await this.authService.logout(dto.refreshToken);

    return result;
  }
}
