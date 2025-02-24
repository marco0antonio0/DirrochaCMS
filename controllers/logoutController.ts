import { SessaoService } from "@/services/sessaoService";
import { loginService } from "@/services/user/loginService";
import { logoutService } from "@/services/user/logoutService";
import createHttpError from "http-errors";

export const logoutController = {
    async handleLogout(req: any, res: any) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) { throw new createHttpError.Unauthorized('Token inválido ou revogado'); }
        const token = authHeader.split(' ')[1];
        const response = await logoutService.logout(token);
        res.status(200).json(response);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  };