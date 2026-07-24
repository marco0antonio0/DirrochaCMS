import Cookies from "js-cookie";
import { logoutService } from "@/backend/auth/auth.service";
import { adminPath } from "@/app/lib/admin-path";
export async function logout(router:any){
    
    const token = Cookies.get("token"); 
    await logoutService.logout(token||"")
    Cookies.remove("token"); 
    router.push(adminPath())
  }
