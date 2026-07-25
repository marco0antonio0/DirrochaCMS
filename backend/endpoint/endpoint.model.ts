import type { Actor } from "@/backend/common/actor";

export interface EndpointField {
  name: string;
  type: "string" | "number" | "date" | "img";
  mult?: boolean;
}

export interface EndpointPayload {
  title: string;
  router: string;
  campos: Array<string | EndpointField>;
  fixedValuesEnabled?: boolean;
  cacheTtlSeconds?: number;
  accessMode?: "public" | "password";
  /** Texto puro recebido da UI; convertido em `accessPasswordHash` antes de persistir. */
  accessPassword?: string;
}

export interface EndpointUpdatePayload {
  title?: string;
  router?: string;
  fixedValuesEnabled?: boolean;
  cacheTtlSeconds?: number;
  accessMode?: "public" | "password";
  accessPassword?: string;
  cacheRefreshedAt?: Date;
  updatedAt?: Date;
}

/**
 * Forma devolvida ao painel.
 *
 * Nunca inclui `accessPassword` nem `accessPasswordHash`: a UI so precisa saber SE
 * existe senha configurada. O valor e exibido uma unica vez, no momento em que e
 * definido, e depois nao pode mais ser recuperado.
 */
export interface EndpointRecord {
  id: string;
  title: string;
  router: string;
  campos: Array<string | EndpointField>;
  fixedValuesEnabled: boolean;
  cacheTtlSeconds: number;
  accessMode: "public" | "password";
  accessPasswordSet: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  cacheRefreshedAt?: Date;
  createdBy?: Actor;
  updatedBy?: Actor;
}
