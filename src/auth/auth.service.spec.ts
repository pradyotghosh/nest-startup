import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";

import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";

import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";

import { AuthRole, AuthStatus, User } from "./models/auth";

import { UserNotFoundException } from "../common/Exceptions/user-not-found.exception";
import { DuplicateEmailException } from "../common/Exceptions/duplicate-email.exception";

jest.mock("argon2", () => ({
  verify: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;

  const mockAuthRepository = {
    create: jest.fn(),
    isUserExist: jest.fn(),
    getUserDataByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockVerify = jest.mocked(argon2.verify);

  const fakeUser: User = {
    id: 1,
    userName: "test@test.com",
    email: "test@test.com",
    passwordHash: "hashed-password",
    roleId: AuthRole.USER,
    status: AuthStatus.ENABLED,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },

        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("registerUser", () => {
    it("should register a user", async () => {
      const dto: CreateUserDto = {
        email: "test@test.com",
        password: "abcd",
      };

      mockAuthRepository.create.mockResolvedValue(fakeUser);

      const result = await service.registerUser(dto);

      expect(mockAuthRepository.create).toHaveBeenCalledWith(dto);

      expect(mockAuthRepository.create).toHaveBeenCalledTimes(1);

      expect(result).toEqual(fakeUser);
    });

    it("should throw when repository rejects duplicate email", async () => {
      const dto: CreateUserDto = {
        email: "test@test.com",
        password: "abcd",
      };

      mockAuthRepository.create.mockRejectedValue(
        new DuplicateEmailException(),
      );

      await expect(service.registerUser(dto)).rejects.toBeInstanceOf(
        DuplicateEmailException,
      );
    });
  });

  describe("loginUser", () => {
    const dto: LoginUserDto = {
      email: "test@test.com",
      password: "abcd",
    };

    it("should throw UserNotFoundException when user does not exist", async () => {
      mockAuthRepository.isUserExist.mockResolvedValue(false);

      await expect(service.loginUser(dto)).rejects.toBeInstanceOf(
        UserNotFoundException,
      );

      expect(mockAuthRepository.isUserExist).toHaveBeenCalledWith(dto.email);

      expect(mockAuthRepository.getUserDataByEmail).not.toHaveBeenCalled();

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when password is incorrect", async () => {
      mockAuthRepository.isUserExist.mockResolvedValue(true);

      mockAuthRepository.getUserDataByEmail.mockResolvedValue(fakeUser);

      mockVerify.mockResolvedValue(false);

      await expect(service.loginUser(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(mockVerify).toHaveBeenCalledWith(
        fakeUser.passwordHash,
        dto.password,
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it("should login user and return JWT token", async () => {
      mockAuthRepository.isUserExist.mockResolvedValue(true);

      mockAuthRepository.getUserDataByEmail.mockResolvedValue(fakeUser);

      mockVerify.mockResolvedValue(true);

      mockJwtService.signAsync.mockResolvedValue("fake-jwt-token");

      const result = await service.loginUser(dto);

      expect(mockAuthRepository.isUserExist).toHaveBeenCalledWith(dto.email);

      expect(mockAuthRepository.getUserDataByEmail).toHaveBeenCalledWith(
        dto.email,
      );

      expect(mockVerify).toHaveBeenCalledWith(
        fakeUser.passwordHash,
        dto.password,
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: fakeUser.id,
        email: fakeUser.email,
        role: fakeUser.roleId,
      });

      expect(result.token).toBe("fake-jwt-token");

      expect(result.user).not.toHaveProperty("passwordHash");

      const { passwordHash, ...userWithoutPassword } = fakeUser;

      expect(result).toEqual({
        token: "fake-jwt-token",
        user: userWithoutPassword,
      });
    });
  });
});
