import { ConflictException } from "@nestjs/common";

export class UserNotFoundException extends ConflictException {
  constructor() {
    super("User Not found!");
  }
}
