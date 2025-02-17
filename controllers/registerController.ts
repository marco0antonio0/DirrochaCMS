import { registerService } from "@/services/user/registerService";

export const registerController = {
  async handleRegister(req: any, res: any) {
    try {
      const { email, password, name } = req.body;
      const response = await registerService.register(email, password, name);
      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};