import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/backend/config/admin";
import { ENDPOINT_COLLECTION } from "@/backend/endpoint/endpoint.entity";
import { hashEndpointPassword } from "@/backend/endpoint/endpointPassword";
import type { EndpointPayload, EndpointRecord, EndpointUpdatePayload } from "@/backend/endpoint/endpoint.model";
import type { Actor } from "@/backend/common/actor";

const endpointsRef = () => adminDb.collection(ENDPOINT_COLLECTION);

const toDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  if (typeof value?.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};

/** Remove o material secreto antes de qualquer coisa sair da camada de dados. */
const toPublicEndpoint = (id: string, data: Record<string, any>): EndpointRecord => ({
  id,
  title: data.title ?? "",
  router: data.router ?? "",
  campos: data.campos ?? [],
  fixedValuesEnabled: data.fixedValuesEnabled === true,
  cacheTtlSeconds: typeof data.cacheTtlSeconds === "number" ? data.cacheTtlSeconds : 300,
  accessMode: data.accessMode === "password" ? "password" : "public",
  accessPasswordSet: !!(data.accessPasswordHash || data.accessPassword),
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  cacheRefreshedAt: toDate(data.cacheRefreshedAt),
  createdBy: data.createdBy,
  updatedBy: data.updatedBy,
});

export class EndpointRepository {
  async createEndpoint(payload: EndpointPayload, actor?: Actor) {
    try {
      const usaSenha = payload.accessMode === "password";

      const docRef = await endpointsRef().add({
        title: payload.title,
        router: payload.router,
        campos: payload.campos,
        fixedValuesEnabled: payload.fixedValuesEnabled ?? false,
        cacheTtlSeconds: payload.cacheTtlSeconds ?? 300,
        accessMode: usaSenha ? "password" : "public",
        ...(usaSenha && payload.accessPassword
          ? { accessPasswordHash: hashEndpointPassword(payload.accessPassword) }
          : {}),
        ...(actor ? { createdBy: actor } : {}),
        createdAt: new Date(),
      });

      return { success: true as const, id: docRef.id };
    } catch (error) {
      console.error("Erro ao salvar endpoint:", error);
      return { success: false as const, error };
    }
  }

  async getEndpoints() {
    try {
      const snapshot = await endpointsRef().get();
      return {
        success: true as const,
        data: snapshot.docs.map((doc) => toPublicEndpoint(doc.id, doc.data())),
      };
    } catch (error) {
      console.error("Erro ao listar endpoints:", error);
      return { success: false as const, error, data: [] as EndpointRecord[] };
    }
  }

  async getEndpointById(endpointId: string) {
    const doc = await endpointsRef().doc(endpointId).get();
    if (!doc.exists) return null;
    return toPublicEndpoint(doc.id, doc.data()!);
  }

  /**
   * Busca pelo nome publico da rota, incluindo o material de senha.
   * Uso exclusivo da rota publica `/api/[router]`, que precisa verificar o segredo.
   */
  async findByRouterWithSecret(router: string) {
    const snapshot = await endpointsRef().where("router", "==", router).limit(1).get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      router: data.router as string,
      accessMode: (data.accessMode === "password" ? "password" : "public") as "public" | "password",
      accessPasswordHash: data.accessPasswordHash as string | undefined,
      accessPassword: data.accessPassword as string | undefined,
      fixedValuesEnabled: data.fixedValuesEnabled === true,
      cacheTtlSeconds: typeof data.cacheTtlSeconds === "number" ? data.cacheTtlSeconds : 300,
    };
  }

  /** Impede dois endpoints com o mesmo nome de rota (antes nao havia checagem). */
  async isRouterTaken(router: string, exceptEndpointId?: string) {
    const snapshot = await endpointsRef().where("router", "==", router).limit(2).get();
    return snapshot.docs.some((doc) => doc.id !== exceptEndpointId);
  }

  async updateEndpointById(endpointId: string, payload: EndpointUpdatePayload, actor?: Actor) {
    try {
      const patch: Record<string, unknown> = { ...payload, updatedAt: new Date() };

      // Nunca persistir a senha em texto puro.
      delete patch.accessPassword;

      if (payload.accessMode === "public") {
        // Voltar a publico apaga o segredo; nao basta ignorar o campo.
        patch.accessMode = "public";
        patch.accessPasswordHash = FieldValue.delete();
        patch.accessPassword = FieldValue.delete();
      } else if (payload.accessMode === "password" && payload.accessPassword) {
        patch.accessPasswordHash = hashEndpointPassword(payload.accessPassword);
        // Remove eventual resquicio em texto puro de antes da migracao.
        patch.accessPassword = FieldValue.delete();
      }

      if (actor) patch.updatedBy = actor;

      await endpointsRef().doc(endpointId).update(patch);
      return { success: true as const };
    } catch (error) {
      console.error("Erro ao atualizar o endpoint:", error);
      return { success: false as const, error };
    }
  }

  /**
   * Exclusao com cascata.
   *
   * O Firestore nao remove subcolecoes junto com o documento pai: a versao anterior
   * deixava `itens` e `history` orfaos no banco para sempre.
   */
  async deleteEndpointById(endpointId: string) {
    try {
      const docRef = endpointsRef().doc(endpointId);
      await adminDb.recursiveDelete(docRef);
      return { success: true as const };
    } catch (error) {
      console.error("Erro ao deletar o endpoint:", error);
      return { success: false as const, error };
    }
  }
}

export const endpointRepository = new EndpointRepository();
