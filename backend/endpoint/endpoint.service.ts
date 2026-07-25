import "server-only";
import { endpointRepository, EndpointRepository } from "@/backend/endpoint/endpoint.repository";
import { isReservedRouter } from "@/backend/endpoint/endpoint.entity";
import type { EndpointPayload, EndpointUpdatePayload } from "@/backend/endpoint/endpoint.model";
import type { Actor } from "@/backend/common/actor";
import { historyService } from "@/backend/history/history.service";
import { auditService } from "@/backend/audit/audit.service";

export class EndpointServiceError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
  }
}

const ROUTER_PATTERN = /^[a-zA-Z0-9_]+$/;

export class EndpointService {
  constructor(private readonly repository: EndpointRepository) {}

  private async assertRouterUsable(router: string, exceptEndpointId?: string) {
    if (!ROUTER_PATTERN.test(router)) {
      throw new EndpointServiceError("A rota deve usar apenas letras, numeros e underscores");
    }
    if (isReservedRouter(router)) {
      throw new EndpointServiceError(`"${router}" e um nome reservado do sistema`);
    }
    if (await this.repository.isRouterTaken(router, exceptEndpointId)) {
      throw new EndpointServiceError("Ja existe um endpoint com essa rota", 409);
    }
  }

  async addEndpoint(payload: EndpointPayload, actor: Actor) {
    const router = payload.router?.trim();
    if (!router) throw new EndpointServiceError("Informe o nome da rota");

    await this.assertRouterUsable(router);

    const result = await this.repository.createEndpoint(
      { ...payload, router, title: payload.title?.trim() || router },
      actor,
    );
    if (!result.success) throw new EndpointServiceError("Erro ao criar endpoint", 500);

    await historyService.record(result.id, {
      action: "endpoint_created",
      actor,
      summary: `Endpoint "${router}" criado`,
    });

    return result;
  }

  async listEndpoints() {
    return this.repository.getEndpoints();
  }

  async deleteEndpoint(endpointId: string, actor: Actor) {
    const endpoint = await this.repository.getEndpointById(endpointId);
    if (!endpoint) throw new EndpointServiceError("Endpoint nao encontrado", 404);

    const result = await this.repository.deleteEndpointById(endpointId);
    if (!result.success) throw new EndpointServiceError("Erro ao deletar o endpoint", 500);

    // O historico do endpoint era uma subcolecao dele e foi removido junto; por isso a
    // exclusao vai para a auditoria global, que sobrevive ao recurso.
    await auditService.record({
      action: "endpoint_deleted",
      actor,
      summary: `Endpoint "${endpoint.router}" excluido com todos os registros`,
      metadata: { endpointId, router: endpoint.router },
    });

    return result;
  }

  async updateEndpoint(
    endpointId: string,
    payload: EndpointUpdatePayload,
    actor: Actor,
    summary?: string,
  ) {
    const current = await this.repository.getEndpointById(endpointId);
    if (!current) throw new EndpointServiceError("Endpoint nao encontrado", 404);

    if (payload.router && payload.router.trim() !== current.router) {
      await this.assertRouterUsable(payload.router.trim(), endpointId);
    }

    if (payload.accessMode === "password" && !payload.accessPassword && !current.accessPasswordSet) {
      throw new EndpointServiceError("Informe uma senha para deixar o endpoint privado");
    }

    const result = await this.repository.updateEndpointById(endpointId, payload, actor);
    if (!result.success) throw new EndpointServiceError("Erro ao salvar configuracoes", 500);

    await historyService.record(endpointId, {
      action: "endpoint_updated",
      actor,
      summary: summary || "Configuracoes do endpoint atualizadas",
    });

    return result;
  }

  async refreshEndpointCache(endpointId: string, actor: Actor) {
    const cacheRefreshedAt = new Date();
    const result = await this.repository.updateEndpointById(endpointId, { cacheRefreshedAt }, actor);
    if (!result.success) throw new EndpointServiceError("Erro ao atualizar cache", 500);

    return { ...result, cacheRefreshedAt };
  }
}

export const endpointService = new EndpointService(endpointRepository);
