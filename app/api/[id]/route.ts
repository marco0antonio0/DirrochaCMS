import { handlePublicEndpoint } from "@/backend/endpoint/endpoint.controller";

/**
 * API publica de leitura de um endpoint.
 *
 * Antes todos os verbos apontavam para o mesmo handler de leitura, o que fazia um POST
 * responder com a listagem. Agora apenas leitura e preflight sao expostos; o resto
 * recebe 405 pelo proprio Next.
 */
export const GET = handlePublicEndpoint;
export const HEAD = handlePublicEndpoint;
export const OPTIONS = handlePublicEndpoint;
