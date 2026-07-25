import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeString } from "@/backend/common/normalizeString";
import { endpointRepository } from "@/backend/endpoint/endpoint.repository";
import { verifyEndpointPassword } from "@/backend/endpoint/endpointPassword";
import { itemService } from "@/backend/item/item.service";
import { consumeRateLimit, getClientIp } from "@/backend/common/rateLimit";

/**
 * Limite da API publica.
 *
 * Cada requisicao gera leituras no Firestore, entao um laco sem limite viraria custo
 * real na fatura. O teto e generoso para nao atrapalhar uso legitimo (inclusive sites
 * que consultam a cada carregamento de pagina).
 */
const LIMITE_PUBLICO = { limit: 120, windowSeconds: 60 };

/** Tentativas de senha de endpoint: bem mais restrito, e um segredo sendo adivinhado. */
const LIMITE_SENHA_ENDPOINT = { limit: 10, windowSeconds: 10 * 60 };

/**
 * API publica de um endpoint: `GET /api/{router}`.
 *
 * Unica rota anonima da aplicacao. Le pelo Admin SDK, portanto continua funcionando
 * com as security rules fechadas.
 */

const CORS_HEADERS: Record<string, string> = {
  // `*` e incompativel com Allow-Credentials, e esta API nao usa cookies:
  // enviar os dois (como antes) faz o browser ignorar ambos.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers":
    "Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-endpoint-password",
};

const jsonResponse = (body: unknown, status: number, extraHeaders: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...CORS_HEADERS, ...extraHeaders } });

/** Remove a atribuicao de autoria antes de expor o item publicamente. */
const sanitizeItemForPublic = (item: any) => {
  const { createdBy, updatedBy, ...publicItem } = item;
  return publicItem;
};

const getRequestPassword = (request: NextRequest) => request.headers.get("x-endpoint-password") || "";

const toMillis = (value: any) => {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = new Date(value).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

export async function handlePublicEndpoint(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse({ error: "Metodo nao permitido", statusCode: 405 }, 405);
  }

  const { id } = await context.params;
  if (!id) return jsonResponse({ error: "Parametro nao informado", statusCode: 400 }, 400);

  const ip = getClientIp(request);

  // Antes de qualquer leitura no banco, para que o abuso nao gere custo.
  const limite = await consumeRateLimit({ key: `publico:${ip}:${id}`, ...LIMITE_PUBLICO });
  if (!limite.allowed) {
    return jsonResponse({ error: "Muitas requisicoes", statusCode: 429 }, 429, {
      "Retry-After": String(limite.retryAfterSeconds),
    });
  }

  // Antes esta rota lia a colecao `endpoints` inteira e filtrava em JS a cada request.
  const endpoint = await endpointRepository.findByRouterWithSecret(id);
  if (!endpoint) return jsonResponse({ error: "Rota nao encontrada", statusCode: 404 }, 404);

  if (endpoint.accessMode === "password") {
    // Limite separado e mais rigido: aqui um segredo esta sendo adivinhado.
    const tentativas = await consumeRateLimit({
      key: `senha-endpoint:${ip}:${endpoint.id}`,
      ...LIMITE_SENHA_ENDPOINT,
    });
    if (!tentativas.allowed) {
      return jsonResponse({ error: "Muitas tentativas de senha", statusCode: 429 }, 429, {
        "Retry-After": String(tentativas.retryAfterSeconds),
      });
    }

    const ok = verifyEndpointPassword(getRequestPassword(request), endpoint);
    if (!ok) {
      return jsonResponse(
        { error: "Senha do endpoint invalida ou nao informada", statusCode: 401 },
        401,
      );
    }
  }

  const cacheHeaders: Record<string, string> = {};
  if (endpoint.fixedValuesEnabled) {
    const ttl = Math.max(Number(endpoint.cacheTtlSeconds || 0), 0);
    cacheHeaders["Cache-Control"] = `public, max-age=${ttl}, s-maxage=${ttl}`;
  }

  const items = await itemService.getItems(endpoint.id);
  if (!items.success) return jsonResponse({ error: "Erro interno", statusCode: 500 }, 500);

  const ordered = [...items.data].sort((a: any, b: any) => toMillis(b.createdAt) - toMillis(a.createdAt));

  const searchTerm = request.nextUrl.searchParams.get("t");
  if (searchTerm !== null) {
    if (!searchTerm) {
      return jsonResponse({ error: "Parametro 't' e obrigatorio", statusCode: 400 }, 400);
    }

    const normalized = normalizeString(searchTerm);
    const results = ordered.filter(
      (item: any) => normalizeString(item?.formattedData?.titulo_identificador) === normalized,
    );

    if (results.length === 0) {
      return jsonResponse({ error: "Nenhum resultado encontrado", statusCode: 404 }, 404);
    }

    return jsonResponse(
      { data: results.map(sanitizeItemForPublic), statusCode: 200 },
      200,
      cacheHeaders,
    );
  }

  return jsonResponse({ data: ordered.map(sanitizeItemForPublic), statusCode: 200 }, 200, cacheHeaders);
}
