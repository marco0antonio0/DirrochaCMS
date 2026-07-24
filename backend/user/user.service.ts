import { IsStartedfirebaseConfig } from "@/backend/config/config";
import { userRepository, UserRepository } from "@/backend/user/user.repository";
import type { AuthVisibilitySettings } from "@/backend/user/user.model";

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async listUsers() {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.findUsers();
  }

  async getUserByEmail(email: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.findUserByEmail(email);
  }

  async getAuthVisibility() {
    try {
      return await this.repository.getAuthVisibility();
    } catch (error) {
      console.error("Erro ao obter configurações:", error);
      return { loginEnabled: false, registerEnabled: false, logoutEnabled: false };
    }
  }

  async setAuthVisibility(status: AuthVisibilitySettings) {
    try {
      await this.repository.setAuthVisibility(status);
      return true;
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      return false;
    }
  }

  async deleteUser(email: string) {
    return this.repository.deleteUserByEmail(email);
  }
}

export const userService = new UserService(userRepository);
export const User = userService;
