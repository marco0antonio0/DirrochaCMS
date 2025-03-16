import { db } from '@/config/config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const endpointRepository = {
  async createEndpoint({ title, router, campos, privateRouter }: { title: string, router: string, campos: string[], privateRouter: boolean }) {
    try {
      const docRef = await addDoc(collection(db, 'endpoints'), {
        title,
        router,
        campos,
        private: privateRouter,
        createdAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao salvar endpoint:', error);
      return { success: false, error };
    }
  },
  async getEndpoints() {
    try {
      const endppointRef = collection(db, 'endpoints')
      const querySnapshot = await getDocs(endppointRef);
      const endpoints = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { success: true, data: endpoints };
    } catch (error) {
      console.error('Erro ao listar endpoints:', error);
      return { success: false, error };
    }
  },
  async deleteEndpointById(itemId: string) {
    try {
      const itemRef = doc(db, 'endpoints', itemId);
      await deleteDoc(itemRef);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar o endpoint:', error);
      return { success: false, error };
    }
  },
};