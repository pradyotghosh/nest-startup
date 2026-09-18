import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UpdateUsersDto } from './dto/update-users.dto';
import { UserProfile } from './models/users';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findMe(@CurrentUser('sub') userId: number): Promise<UserProfile> {
    return this.usersService.findById(userId);
  }

  @Put()
  update(
    @Body() updateUserDto: UpdateUsersDto,
    @CurrentUser('sub') userId: number,
  ): Promise<UserProfile> {
    return this.usersService.update(updateUserDto, userId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    await this.usersService.remove(userId);
  }
}
