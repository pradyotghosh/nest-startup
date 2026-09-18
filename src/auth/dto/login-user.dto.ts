import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, isPhoneNumber, IsString } from "class-validator";

export class LoginUserDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: "test@test.com",
  })
  email!: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "abcd",
  })
  password!: string;
}
