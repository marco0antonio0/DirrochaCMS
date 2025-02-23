import { SessaoRepository } from "@/repositories/sessaoRepository";
import jwt from "jsonwebtoken";
import verifyToken  from "./verifyToken";

export class SessaoService {
  private sessaoRepository: SessaoRepository;

  constructor() {
    this.sessaoRepository = new SessaoRepository();
  }

  async createSessao({ token }: { token: string }) {
    try {
      const isValidToken: any = await verifyToken(token);
      const tokenDecoded:any = jwt.decode(token)
      if(!isValidToken) return { success: false, message: "Token inválido" };
        
      const email = tokenDecoded?.name;
      const existingSessao = await this.sessaoRepository.getSessaoByEmail(email);

      if (existingSessao.success) {
        return { success: false, message: "Já existe uma sessão ativa para este email." };
      }

      return await this.sessaoRepository.createSessao({ email, token });
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      return { success: false, error };
    }
  }

  async updateSessao({ token }: { token: string }) {
    try {
        const isValidToken: any = await verifyToken(token);
        const tokenDecoded:any = jwt.decode(token)
        if(!isValidToken) return { success: false, message: "Token inválido" };
          
        const email = tokenDecoded?.name;
        const existingSessao = await this.sessaoRepository.getSessaoByEmail(email);

      if (!existingSessao.success) {
        return { success: false, message: "Nenhuma sessão ativa encontrada para este email." };
      }

      return await this.sessaoRepository.updateSessao({ email, token });
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      return { success: false, error };
    }
  }

  async deleteSessao(token: string) {
    try {
      const isValidToken:any = await verifyToken(token) 
      const email = isValidToken['data']['email']
      const existingSessao = await this.sessaoRepository.getSessaoByEmail(email);

      if (!existingSessao.success) {
        return { success: false, message: "Nenhuma sessão ativa encontrada para este email." };
      }

      return await this.sessaoRepository.deleteSessao(email);
    } catch (error) {
      console.error("Erro ao deletar sessão:", error);
      return { success: false, error };
    }
  }

  async validateToken({ token }: { token: string }) {
    try {
      const isValidToken: any = await verifyToken(token);
      const tokenDecoded:any = jwt.decode(token)
      if(!isValidToken) return { success: false, message: "Token inválido" };
      
      const email = tokenDecoded?.name;
      if (!email) return { success: false, message: "Token inválido" };
      
      const existingSessao = await this.sessaoRepository.getSessaoByEmail(email);

      if (existingSessao.success) {
        // Se a sessão já existe, apenas atualiza o token
        return await this.sessaoRepository.updateSessao({ email, token });
      } else {
    // Se a sessão não existe, cria uma nova
        return await this.sessaoRepository.createSessao({ email, token });
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      return { success: false, error };
    }
  }
}
