import { loginController } from "@/controllers/loginController";
import { User } from "@/services/user/user";

export  default async (req: any, res: any) => {
 let response = await User.getAuthVisibility()
 let newData = response.loginEnabled??false
 if (req.method === 'POST' && newData) return loginController.handleLogin(req, res);
 res.status(405).json({ error: 'Method not allowed' });
};