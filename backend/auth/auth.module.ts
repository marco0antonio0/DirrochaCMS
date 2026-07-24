import { authController, AuthController } from "@/backend/auth/auth.controller";
import { authRepository, AuthRepository } from "@/backend/auth/auth.repository";
import { authService, AuthService } from "@/backend/auth/auth.service";

export class AuthModule {
  readonly controller: AuthController;
  readonly service: AuthService;
  readonly repository: AuthRepository;

  constructor() {
    this.repository = authRepository;
    this.service = authService;
    this.controller = authController;
  }
}

export const authModule = new AuthModule();
