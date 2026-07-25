import { userService, UserService } from "@/backend/user/user.service";

export class UserController {
  constructor(private readonly service: UserService) {}

  listUsers = this.service.listUsers.bind(this.service);
  getUserByEmail = this.service.getUserByEmail.bind(this.service);
  createUser = this.service.createUser.bind(this.service);
  updateUser = this.service.updateUser.bind(this.service);
  deleteUser = this.service.deleteUser.bind(this.service);
  deleteUserById = this.service.deleteUserById.bind(this.service);
}

export const userController = new UserController(userService);
