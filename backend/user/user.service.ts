import { IsStartedfirebaseConfig } from "@/backend/config/config";
import { userRepository, UserRepository } from "@/backend/user/user.repository";
import type { UserUpdatePayload } from "@/backend/user/user.model";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async listUsers() {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado", data: [] };
    const data = await this.repository.findUsers();
    return { success: true, data };
  }

  async getUserByEmail(email: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.findUserByEmail(email);
  }

  async createUser({ name, email, password, canManageUsers }: { name: string; email: string; password: string; canManageUsers?: boolean }) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    const existingUser = await this.repository.findUserByEmail(email);
    if (existingUser) return { success: false, error: "E-mail já cadastrado" };

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await this.repository.createUser({
      name,
      email,
      password: hashedPassword,
      disabled: false,
      canManageUsers: canManageUsers ?? false,
    });
    return { success: true, id };
  }

  async updateUser(userId: string, payload: UserUpdatePayload) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    const nextPayload = { ...payload };
    if (nextPayload.password) {
      nextPayload.password = await bcrypt.hash(nextPayload.password, 10);
    } else {
      delete nextPayload.password;
    }

    return this.repository.updateUserById(userId, nextPayload);
  }

  async deleteUser(email: string) {
    return this.repository.deleteUserByEmail(email);
  }

  async deleteUserById(userId: string) {
    return this.repository.deleteUserById(userId);
  }
}

export const userService = new UserService(userRepository);
export const User = userService;
