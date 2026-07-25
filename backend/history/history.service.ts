import { IsStartedfirebaseConfig } from "@/backend/config/config";
import { historyRepository, HistoryRepository } from "@/backend/history/history.repository";
import type { HistoryEntryPayload } from "@/backend/history/history.model";

export class HistoryService {
  constructor(private readonly repository: HistoryRepository) {}

  async record(endpointId: string, payload: HistoryEntryPayload) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.addEntry(endpointId, payload);
  }

  async list(endpointId: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado", data: [] };
    return this.repository.listEntries(endpointId);
  }
}

export const historyService = new HistoryService(historyRepository);
export const History = historyService;
