import Cookies from "js-cookie";
import { useRouter } from "next/router";
export function logout(router:any){
    Cookies.remove("token"); 
    router.push("/")
  }