import verifyToken from "@/backend/auth/auth.service";
import { sessaoRepository, SessaoRepository } from "@/backend/sessao/sessao.repository";
import jwt from "jsonwebtoken";

export class SessaoService {
  constructor(private readonly repository: SessaoRepository = sessaoRepository) {}

  async createSessao({ token }: { token: string }) {
    try {
      const email = await this.getEmailFromValidToken(token);
      if (!email) return { success: false, message: "Token inválido" };

      const existingSessao = await this.repository.getSessaoByEmail(email);
      if (existingSessao.success) {
        return { success: false, message: "Já existe uma sessão ativa para este email." };
      }

      return this.repository.createSessao({ email, token });
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      return { success: false, error };
    }
  }

  async updateSessao({ token }: { token: string }) {
    try {
      const email = await this.getEmailFromValidToken(token);
      if (!email) return { success: false, message: "Token inválido" };

      const existingSessao = await this.repository.getSessaoByEmail(email);
      if (!existingSessao.success) {
        return { success: false, message: "Nenhuma sessão ativa encontrada para este email." };
      }

      return this.repository.updateSessao({ email, token });
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      return { success: false, error };
    }
  }

  async deleteSessao(token: string) {
    try {
      const email = await this.getEmailFromValidToken(token);
      if (!email) return { success: false, message: "Token inválido" };

      const existingSessao = await this.repository.getSessaoByEmail(email);
      if (!existingSessao.success) {
        return { success: false, message: "Nenhuma sessão ativa encontrada para este email." };
      }

      return this.repository.deleteSessao(email);
    } catch (error) {
      console.error("Erro ao deletar sessão:", error);
      return { success: false, error };
    }
  }

  async validateToken({ token }: { token: string }) {
    try {
      const email = await this.getEmailFromValidToken(token);
      if (!email) return { success: false, message: "Token inválido" };

      const existingSessao = await this.repository.getSessaoByEmail(email);
      if (existingSessao.success) {
        return this.repository.updateSessao({ email, token });
      }

      return this.repository.createSessao({ email, token });
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      return { success: false, error };
    }
  }

  private async getEmailFromValidToken(token: string) {
    const isValidToken = await verifyToken(token);
    if (!isValidToken) return null;

    const decoded: any = jwt.decode(token);
    return decoded?.name || null;
  }
}

export const sessaoService = new SessaoService(sessaoRepository);
