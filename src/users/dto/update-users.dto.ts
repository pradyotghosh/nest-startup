import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUsersDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstName?: string;
  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;
  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // profileImageId?: number;
}
