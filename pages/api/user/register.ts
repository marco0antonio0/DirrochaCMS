import { registerController } from "@/controllers/registerController";
import { User } from "@/services/user/user";

export default async (req: any, res: any) => {
  let response = await User.getAuthVisibility()
  let newData = response.registerEnabled??false
    if (req.method === 'POST' && newData) return registerController.handleRegister(req, res);
    res.status(405).json({ error: 'Method not allowed' });
  };