import { loginController } from "@/controllers/loginController";
import { logoutController } from "@/controllers/logoutController";
import { User } from "@/services/user/user";

export  default async (req: any, res: any) => {
 let response = await User.getAuthVisibility()
 let newData = response.logoutEnabled??false
 if (req.method === 'POST' && newData) return logoutController.handleLogout(req, res);
 res.status(405).json({ error: 'Method not allowed' });
};