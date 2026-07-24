import { userService, UserService } from "@/backend/user/user.service";

export class UserController {
  constructor(private readonly service: UserService) {}

  listUsers = this.service.listUsers.bind(this.service);
  getUserByEmail = this.service.getUserByEmail.bind(this.service);
  getAuthVisibility = this.service.getAuthVisibility.bind(this.service);
  setAuthVisibility = this.service.setAuthVisibility.bind(this.service);
  deleteUser = this.service.deleteUser.bind(this.service);
}

export const userController = new UserController(userService);
