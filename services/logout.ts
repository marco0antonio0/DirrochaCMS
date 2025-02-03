import Cookies from "js-cookie";
export function logout(){
    Cookies.remove("token"); 
    window.location.href = "/"; 
  }