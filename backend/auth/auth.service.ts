import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { authRepository, AuthRepository } from "@/backend/auth/auth.repository";
import { AUTH_TOKEN_EXPIRES_IN, LEGACY_AUTH_TOKEN_EXPIRES_IN } from "@/backend/auth/auth.entity";
import { SessaoRepository } from "@/backend/sessao/sessao.repository";
import { SessaoService } from "@/backend/sessao/sessao.service";
import { userRepository, UserRepository } from "@/backend/user/user.repository";

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || "");
    return !!decoded;
  } catch (error) {
    return false;
  }
};

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly users: UserRepository,
  ) {}

  async login(email: string, password: string) {
    const user: any = await this.users.findUserByEmail(email);
    if (!user) throw new Error("User not found");

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error("Invalid password");

    const token = jwt.sign(
      { name: user.email, id: user.id },
      process.env.SECRET_KEY!,
      { expiresIn: AUTH_TOKEN_EXPIRES_IN },
    );

    const sessaoService = new SessaoService();
    await sessaoService.validateToken({ token });

    return { message: "Login successful", token };
  }

  async register(email: string, password: string, name: string) {
    const saltRounds = 10;
    const existingUser = await this.users.findUserByEmail(email);
    if (existingUser) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = await this.users.createUser({ email, password: hashedPassword, name });

    const token = jwt.sign(
      { name: email, id: userId },
      process.env.SECRET_KEY!,
      { expiresIn: AUTH_TOKEN_EXPIRES_IN },
    );

    const sessaoService = new SessaoService();
    await sessaoService.validateToken({ token });

    return { message: "User registered successfully", token };
  }

  async logout(token: string) {
    try {
      const isValidToken = await verifyToken(token);
      if (!isValidToken) return null;

      const tokenDecoded: any = jwt.decode(token);
      const sessaoRepository = new SessaoRepository();
      const sessao: any = await sessaoRepository.getSessaoByEmail(tokenDecoded.name);
      const tokenDb = sessao.data.token;

      if (token === tokenDb) {
        await sessaoRepository.deleteSessao(tokenDecoded.name);
      }

      return { status: 200, message: "Logout successful", token };
    } catch (error) {
      return null;
    }
  }

  async registerLegacyUser(name: string, password: string): Promise<string> {
    const saltRounds = 10;
    const existingUser = await this.repository.getLegacyUser();
    if (existingUser) throw new Error("Registration is closed");

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await this.repository.saveLegacyUser({ name, password: hashedPassword });

    try {
      const token = jwt.sign({ name }, process.env.SECRET_KEY!, {
        expiresIn: LEGACY_AUTH_TOKEN_EXPIRES_IN,
      });

      const sessaoService = new SessaoService();
      await sessaoService.validateToken({ token });

      return token;
    } catch (error) {
      throw new Error("Erro ao gerar token");
    }
  }

  async loginLegacyUser(name: string, password: string): Promise<string> {
    try {
      const user: any = await this.repository.getLegacyUser();
      if (!user) throw new createHttpError.Unauthorized("Usuario ou senha Incorretos");

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new createHttpError.Unauthorized("Usuario ou senha Incorretos");

      const token = jwt.sign({ name }, process.env.SECRET_KEY!, {
        expiresIn: LEGACY_AUTH_TOKEN_EXPIRES_IN,
      });

      const sessaoService = new SessaoService();
      await sessaoService.validateToken({ token });

      return token;
    } catch (error) {
      return "";
    }
  }
}

export const authService = new AuthService(authRepository, userRepository);
export const loginService = { login: authService.login.bind(authService) };
export const registerService = { register: authService.register.bind(authService) };
export const logoutService = { logout: authService.logout.bind(authService) };
export const registerUser = authService.registerLegacyUser.bind(authService);
export const loginUser = authService.loginLegacyUser.bind(authService);

export default verifyToken;
