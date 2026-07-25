import "server-only";
import { historyRepository, HistoryRepository } from "@/backend/history/history.repository";
import type { HistoryEntryPayload } from "@/backend/history/history.model";

export class HistoryService {
  constructor(private readonly repository: HistoryRepository) {}

  /**
   * Registra uma entrada de auditoria.
   *
   * Nunca lanca: falhar ao gravar o historico nao pode derrubar a operacao que ele
   * descreve (criar um item precisa ter sucesso mesmo se a auditoria falhar).
   */
  async record(endpointId: string, payload: HistoryEntryPayload) {
    try {
      return await this.repository.addEntry(endpointId, payload);
    } catch (error) {
      console.error("Erro ao registrar historico:", error);
      return { success: false as const, error };
    }
  }

  async list(endpointId: string) {
    return this.repository.listEntries(endpointId);
  }
}

export const historyService = new HistoryService(historyRepository);
export const History = historyService;
