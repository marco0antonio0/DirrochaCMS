import { IsStartedfirebaseConfig } from "@/backend/config/config";
import { itemRepository, ItemRepository } from "@/backend/item/item.repository";
import toast from "react-hot-toast";

export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  async deleteItem({ itemId, endpointId }: { itemId: string; endpointId: string }) {
    const toastId = toast.loading("Deletando item do endpoint...", { duration: 4000 });
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };

    try {
      const response = await this.repository.deleteItemById({ itemId, endpointId });
      toast.dismiss(toastId);

      if (response.success) {
        toast.success("Item do endpoint deletado com sucesso", { duration: 4000 });
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

  async createItem({ endpointId, items }: { endpointId: string; items: any[] }) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.createItemForEndpoint(endpointId, items);
  }

  async getItems(endpointId: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.getItemsByEndpoint(endpointId);
  }

  async updateItem({ itemId, endpointId, items }: { itemId: string; endpointId: string; items: any[] }) {
    if (!IsStartedfirebaseConfig) return { success: false, error: "Firebase não inicializado" };
    return this.repository.updateItemForEndpoint({ itemId, endpointId, items });
  }
}

export const itemService = new ItemService(itemRepository);
