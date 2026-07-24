import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { authService, AuthService, verifyToken } from "@/backend/auth/auth.service";
import { sessaoRepository, SessaoRepository } from "@/backend/sessao/sessao.repository";
import { userService, UserService } from "@/backend/user/user.service";

const isInternalRequest = (req: NextApiRequest) => {
  const host = req.headers.host || "";
  const referer = req.headers.referer || "";
  return referer.includes(host);
};

export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly users: UserService,
    private readonly sessions: SessaoRepository,
  ) {}

  handleLogin = async (req: any, res: any) => {
    try {
      const { email, password } = req.body;
      const response = await this.service.login(email, password);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  handleRegister = async (req: any, res: any) => {
    try {
      const { email, password, name } = req.body;
      const response = await this.service.register(email, password, name);
      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  handleLogout = async (req: any, res: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new createHttpError.Unauthorized("Token inválido ou revogado");
      }

      const token = authHeader.split(" ")[1];
      const response = await this.service.logout(token);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  handleConfiguredLogin = async (req: any, res: any) => {
    const response = await this.users.getAuthVisibility();
    const isEnabled = response.loginEnabled ?? false;
    if (req.method === "POST" && isEnabled) return this.handleLogin(req, res);
    return res.status(405).json({ error: "Method not allowed" });
  };

  handleConfiguredRegister = async (req: any, res: any) => {
    const response = await this.users.getAuthVisibility();
    const isEnabled = response.registerEnabled ?? false;
    if (req.method === "POST" && isEnabled) return this.handleRegister(req, res);
    return res.status(405).json({ error: "Method not allowed" });
  };

  handleConfiguredLogout = async (req: any, res: any) => {
    const response = await this.users.getAuthVisibility();
    const isEnabled = response.logoutEnabled ?? false;
    if (req.method === "POST" && isEnabled) return this.handleLogout(req, res);
    return res.status(405).json({ error: "Method not allowed" });
  };

  handleVerifyToken = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const tokenDecoded: any = jwt.decode(token);
    const email = tokenDecoded?.name;
    const existingSessao: any = await this.sessions.getSessaoByEmail(email);

    if (existingSessao.success === true) {
      const tokenDb = existingSessao.data.token;
      if (tokenDb !== token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    return res.status(200).json({ valid: true, user: decoded });
  };

  handleLegacyRegister = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!isInternalRequest(req)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    try {
      const { name, password } = req.body;
      const token = await this.service.registerLegacyUser(name, password);
      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  handleLegacyLogin = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!isInternalRequest(req)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    try {
      const { name, password } = req.body;
      const token = await this.service.loginLegacyUser(name, password);
      if (!token) throw new createHttpError.Unauthorized("Usuario ou senha Incorretos");
      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  };
}

export const authController = new AuthController(authService, userService, sessaoRepository);
export const loginController = { handleLogin: authController.handleLogin };
export const registerController = { handleRegister: authController.handleRegister };
export const logoutController = { handleLogout: authController.handleLogout };
