import { IsStartedfirebaseConfig } from '@/config/config';
import { itemRepository } from '../repositories/itemRepository';
import toast from 'react-hot-toast';

export const itemService = {
  async deleteItem(itemId: string) {
    const toastId = toast.loading('Deletando item do endpoint...', { duration: 4000 });
    if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
    try {
      const response = await itemRepository.deleteItemById(itemId);
      toast.dismiss(toastId);
      if (response.success) {
        toast.success('Item do endpoint deletado com sucesso', { duration: 4000 });
      } else {
        toast.error('Erro ao deletar o item do endpoint', { duration: 4000 });
      }
      return response;
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao deletar o item do endpoint', { duration: 4000 });
      return { success: false, error };
    }
  },
  async createItem({endpointId, items}:{endpointId: string, items: any[]}) {
    if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
    return await itemRepository.createItemForEndpoint(endpointId, items);
  },
  async getItems(endpointId: string) {
    if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
    return await itemRepository.getItemsByEndpoint(endpointId);
  },
  async updateItem({itemId ,endpointId, items}:{itemId: string ,endpointId: string, items: any[]}) {
    if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
    return await itemRepository.updateItemForEndpoint({itemId,endpointId, items});
  },
};