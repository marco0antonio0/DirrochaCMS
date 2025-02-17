import { loginService } from "@/services/user/loginService";

export const loginController = {
    async handleLogin(req: any, res: any) {
      try {
        const { email, password } = req.body;
        const response = await loginService.login(email, password);
        res.status(200).json(response);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    },
  };