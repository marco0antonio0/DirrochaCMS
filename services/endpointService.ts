import { IsStartedfirebaseConfig } from '@/config/config';
import { endpointRepository } from '../repositories/endpointRepository';
import toast from 'react-hot-toast';

export const endpointService = {
  async addEndpoint({title, router, campos}:{title: string, router: string, campos: string[]}) {
    if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
    return await endpointRepository.createEndpoint({title, router, campos});
  },
  async listEndpoints() {
    if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
    return await endpointRepository.getEndpoints();
  },
  async deleteEndpoint(itemId: string) {
    const toastId = toast.loading('Deletando item do endpoint...', { duration: 4000 });
    if (!IsStartedfirebaseConfig) return { success: false, error: 'Firebase não inicializado' };
    try {
      const response = await endpointRepository.deleteEndpointById(itemId);
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
};