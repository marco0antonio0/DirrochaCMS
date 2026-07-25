import "server-only";
import { itemRepository, ItemRepository } from "@/backend/item/item.repository";
import { endpointRepository } from "@/backend/endpoint/endpoint.repository";
import { validateItemFields } from "@/backend/item/itemValidation";
import type { Actor } from "@/backend/common/actor";
import { historyService } from "@/backend/history/history.service";

export class ItemServiceError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
  }
}

const getTituloIdentificador = (items: Array<{ title: string; value: unknown }>) =>
  items?.find((item) => item?.title === "titulo_identificador")?.value;

export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  /**
   * Valida os campos contra o schema declarado no endpoint.
   * Feito no servidor porque a UI nao e fronteira de confianca: a API pode ser chamada
   * diretamente, sem passar pelo builder.
   */
  private async validarCampos(endpointId: string, items: unknown) {
    const endpoint = await endpointRepository.getEndpointById(endpointId);
    if (!endpoint) throw new ItemServiceError("O endpoint nao foi encontrado.", 404);

    return validateItemFields(items, endpoint.campos);
  }

  async deleteItem({ itemId, endpointId }: { itemId: string; endpointId: string }, actor: Actor) {
    const response = await this.repository.deleteItemById({ itemId, endpointId });
    if (!response.success) {
      throw new ItemServiceError(
        typeof response.error === "string" ? response.error : "Erro ao deletar o item",
        typeof response.error === "string" ? 404 : 500,
      );
    }

    const deletedTitle = (response as any).data?.formattedData?.titulo_identificador;
    await historyService.record(endpointId, {
      action: "item_deleted",
      actor,
      itemId,
      summary: deletedTitle ? `Item "${deletedTitle}" excluido` : "Item excluido",
    });

    return { success: true as const };
  }

  async createItem({ endpointId, items }: { endpointId: string; items: unknown }, actor: Actor) {
    const validados = await this.validarCampos(endpointId, items);

    const result = await this.repository.createItemForEndpoint(endpointId, validados, actor);
    if (!result.success) {
      throw new ItemServiceError(
        typeof result.error === "string" ? result.error : "Erro ao criar item",
        typeof result.error === "string" ? 404 : 500,
      );
    }

    const title = getTituloIdentificador(validados);
    await historyService.record(endpointId, {
      action: "item_created",
      actor,
      itemId: result.id,
      summary: title ? `Item "${title}" adicionado` : "Item adicionado",
    });

    return result;
  }

  async getItems(endpointId: string) {
    return this.repository.getItemsByEndpoint(endpointId);
  }

  async updateItem(
    { itemId, endpointId, items }: { itemId: string; endpointId: string; items: unknown },
    actor: Actor,
  ) {
    const validados = await this.validarCampos(endpointId, items);

    const result = await this.repository.updateItemForEndpoint(
      { itemId, endpointId, items: validados },
      actor,
    );
    if (!result.success) {
      throw new ItemServiceError(
        typeof result.error === "string" ? result.error : "Erro ao atualizar item",
        typeof result.error === "string" ? 404 : 500,
      );
    }

    const title = getTituloIdentificador(validados);
    await historyService.record(endpointId, {
      action: "item_updated",
      actor,
      itemId,
      summary: title ? `Item "${title}" atualizado` : "Item atualizado",
    });

    return result;
  }
}

export const itemService = new ItemService(itemRepository);
