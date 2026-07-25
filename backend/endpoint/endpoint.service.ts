import { IsStartedfirebaseConfig } from "@/backend/config/config";
import { endpointRepository, EndpointRepository } from "@/backend/endpoint/endpoint.repository";
import type { EndpointPayload, EndpointUpdatePayload } from "@/backend/endpoint/endpoint.model";
import type { Actor } from "@/backend/common/actor";
import { historyService } from "@/backend/history/history.service";
import toast from "react-hot-toast";

export class EndpointService {
  constructor(private readonly repository: EndpointRepository) {}

  async addEndpoint(payload: EndpointPayload, actor?: Actor) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    const result = await this.repository.createEndpoint(payload, actor);

    if (result.success && actor && result.id) {
      await historyService.record(result.id, {
        action: "endpoint_created",
        actor,
        summary: `Endpoint "${payload.title}" criado`,
      });
    }

    return result;
  }

  async listEndpoints() {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.getEndpoints();
  }

  async deleteEndpoint(endpointId: string) {
    const toastId = toast.loading("Deletando endpoint...", { duration: 4000 });
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };

    try {
      const response = await this.repository.deleteEndpointById(endpointId);
      toast.dismiss(toastId);

      if (response.success) {
        toast.success("Endpoint deletado com sucesso", { duration: 4000 });
      } else {
        toast.error("Erro ao deletar o endpoint", { duration: 4000 });
      }

      return response;
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Erro ao deletar o endpoint", { duration: 4000 });
      return { success: false, error };
    }
  }

  async updateEndpoint(endpointId: string, payload: EndpointUpdatePayload, actor?: Actor, summary?: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    const result = await this.repository.updateEndpointById(endpointId, payload, actor);

    if (result.success && actor) {
      await historyService.record(endpointId, {
        action: "endpoint_updated",
        actor,
        summary: summary || "Configurações do endpoint atualizadas",
      });
    }

    return result;
  }

  async refreshEndpointCache(endpointId: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.updateEndpointById(endpointId, { cacheRefreshedAt: new Date() });
  }
}

export const endpointService = new EndpointService(endpointRepository);
