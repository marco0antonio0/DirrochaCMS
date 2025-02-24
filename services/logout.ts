import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { logoutService } from "./user/logoutService";
export async function logout(router:any){
    
    const token = Cookies.get("token"); 
    await logoutService.logout(token||"")
    Cookies.remove("token"); 
    router.push("/")
  }