import { IsStartedfirebaseConfig } from "@/backend/config/config";
import { itemRepository, ItemRepository } from "@/backend/item/item.repository";
import type { Actor } from "@/backend/common/actor";
import { historyService } from "@/backend/history/history.service";
import toast from "react-hot-toast";

const getTituloIdentificador = (items: any[]) =>
  items?.find((item) => item?.title === "titulo_identificador")?.value;

export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  async deleteItem({ itemId, endpointId }: { itemId: string; endpointId: string }, actor?: Actor) {
    const toastId = toast.loading("Deletando item do endpoint...", { duration: 4000 });
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };

    try {
      const response = await this.repository.deleteItemById({ itemId, endpointId });
      toast.dismiss(toastId);

      if (response.success) {
        toast.success("Item do endpoint deletado com sucesso", { duration: 4000 });

        if (actor) {
          const deletedTitle = (response as any).data?.formattedData?.titulo_identificador;
          await historyService.record(endpointId, {
            action: "item_deleted",
            actor,
            itemId,
            summary: deletedTitle ? `Item "${deletedTitle}" excluído` : "Item excluído",
          });
        }
      } else {
        toast.error("Erro ao deletar o item do endpoint", { duration: 4000 });
      }

      return response;
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Erro ao deletar o item do endpoint", { duration: 4000 });
      return { success: false, error };
    }
  }

  async createItem({ endpointId, items }: { endpointId: string; items: any[] }, actor?: Actor) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    const result = await this.repository.createItemForEndpoint(endpointId, items, actor);

    if (result.success && actor && (result as any).id) {
      const title = getTituloIdentificador(items);
      await historyService.record(endpointId, {
        action: "item_created",
        actor,
        itemId: (result as any).id,
        summary: title ? `Item "${title}" adicionado` : "Item adicionado",
      });
    }

    return result;
  }

  async getItems(endpointId: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.getItemsByEndpoint(endpointId);
  }

  async updateItem({ itemId, endpointId, items }: { itemId: string; endpointId: string; items: any[] }, actor?: Actor) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    const result = await this.repository.updateItemForEndpoint({ itemId, endpointId, items }, actor);

    if (result.success && actor) {
      const title = getTituloIdentificador(items);
      await historyService.record(endpointId, {
        action: "item_updated",
        actor,
        itemId,
        summary: title ? `Item "${title}" atualizado` : "Item atualizado",
      });
    }

    return result;
  }
}

export const itemService = new ItemService(itemRepository);
