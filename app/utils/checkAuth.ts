import axios from "axios";
import Cookies from "js-cookie";

export async function checkAuth() {
    const token = Cookies.get("token");
    if (!token) { return false; }
  
    try {
      const response = await axios.get("/api/verifyToken", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }