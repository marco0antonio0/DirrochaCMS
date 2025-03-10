import { db, IsStartedfirebaseConfig } from "@/config/config";
import { userRepository } from "@/repositories/userRepository";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const User = {
    
    async listUsers() {
        if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
        return await userRepository.findUsers();
      },
      async getUserByEmail(email:string){
        if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
        return await userRepository.findUserByEmail(email)
      },
      async getAuthVisibility() {
        const _AUTH_SETTINGS_DOC = "auth_settings"; 
        try {
            const settingsRef = doc(db, "configurations", _AUTH_SETTINGS_DOC);
            const settingsDoc = await getDoc(settingsRef);
            if (settingsDoc.exists()) {
                return {
                    loginEnabled: settingsDoc.data().loginEnabled ?? false,
                    registerEnabled: settingsDoc.data().registerEnabled ?? false,
                    logoutEnabled: settingsDoc.data().logoutEnabled ?? false
                };
            }
            return { loginEnabled: false, registerEnabled: false, logoutEnabled: false };
        } catch (error) {
            console.error("Erro ao obter configurações:", error);
            return { loginEnabled: false, registerEnabled: false, logoutEnabled: false };
        }
    },

    async setAuthVisibility(status: { login: boolean; register: boolean, logout: boolean }) {
        const _AUTH_SETTINGS_DOC = "auth_settings";
        try {
            const settingsRef = doc(db, "configurations", _AUTH_SETTINGS_DOC);
            await setDoc(settingsRef, {
                loginEnabled: status.login,
                registerEnabled: status.register,
                logoutEnabled: status.logout
            });
            return true;
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            return false;
        }
    },
    async deleteUser(email: string) {
        return await userRepository.deleteUserByEmail(email);
    },
}