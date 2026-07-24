import { userController, UserController } from "@/backend/user/user.controller";
import { userRepository, UserRepository } from "@/backend/user/user.repository";
import { userService, UserService } from "@/backend/user/user.service";

export class UserModule {
  readonly controller: UserController;
  readonly service: UserService;
  readonly repository: UserRepository;

  constructor() {
    this.repository = userRepository;
    this.service = userService;
    this.controller = userController;
  }
}

export const userModule = new UserModule();
