export const ENDPOINT_COLLECTION = "endpoints";

/**
 * Nomes de rota proibidos.
 *
 * A API publica de um endpoint fica em `/api/{router}`, servida pela rota dinamica
 * `app/api/[id]`. Um endpoint cujo `router` coincida com um segmento estatico
 * existente (`/api/admin`, `/api/login`, ...) nunca seria alcancado, porque no Next
 * o segmento estatico tem precedencia sobre o dinamico.
 */
export const RESERVED_ROUTERS = ["admin", "login", "register", "verifyToken", "user"] as const;

export const isReservedRouter = (router: string) =>
  RESERVED_ROUTERS.some((reserved) => reserved.toLowerCase() === router.trim().toLowerCase());
