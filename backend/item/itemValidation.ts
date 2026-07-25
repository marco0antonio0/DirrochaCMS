import "server-only";
import type { EndpointField } from "@/backend/endpoint/endpoint.model";

/**
 * Validacao dos campos de um registro.
 *
 * Antes, `toFormattedData` fazia `acc[item.title] = item.value` com o nome do campo vindo
 * direto do request. Duas consequencias: qualquer chave podia ser gravada (inclusive
 * `__proto__`, que alterava o prototipo do objeto e fazia o dado desaparecer em silencio)
 * e nao havia limite de tamanho -- o limite de 200KB das imagens existia apenas no
 * browser, portanto era contornavel chamando a API diretamente.
 */

/** Somando os campos; abaixo do limite de 1MB por documento do Firestore. */
export const MAX_ITEM_BYTES = 900 * 1024;

/** Uma imagem base64 de ~200KB tem ~270KB de string; 600KB da folga sem permitir abuso. */
export const MAX_FIELD_BYTES = 600 * 1024;

export const MAX_TEXT_LENGTH = 20_000;

/** Chaves que nunca podem ser gravadas, mesmo que declaradas no schema. */
const CHAVES_PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);

const TITULO_IDENTIFICADOR = "titulo_identificador";

export class ItemValidationError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const bytes = (valor: string) => Buffer.byteLength(valor, "utf8");

const nomeDoCampo = (campo: string | EndpointField) =>
  typeof campo === "string" ? campo : campo?.name;

const tipoDoCampo = (campo: string | EndpointField) =>
  typeof campo === "string" ? "string" : campo?.type ?? "string";

/**
 * Valida os campos recebidos contra o schema declarado no endpoint e devolve apenas os
 * pares aprovados. Campos nao declarados sao rejeitados, nao ignorados: silenciar
 * esconderia erro de integracao.
 */
export function validateItemFields(
  items: unknown,
  campos: Array<string | EndpointField>,
): Array<{ title: string; value: unknown }> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ItemValidationError("Nenhum campo enviado");
  }

  const declarados = new Map<string, string>();
  for (const campo of campos ?? []) {
    const nome = nomeDoCampo(campo);
    if (nome) declarados.set(nome, tipoDoCampo(campo));
  }
  // Criado automaticamente pelo builder, portanto sempre aceito.
  declarados.set(TITULO_IDENTIFICADOR, "string");

  const vistos = new Set<string>();
  const aprovados: Array<{ title: string; value: unknown }> = [];
  let total = 0;

  for (const item of items) {
    const title = typeof item?.title === "string" ? item.title.trim() : "";

    if (!title) throw new ItemValidationError("Campo sem nome no payload");
    if (CHAVES_PROIBIDAS.has(title)) {
      throw new ItemValidationError(`Nome de campo nao permitido: ${title}`);
    }
    if (!declarados.has(title)) {
      throw new ItemValidationError(`Campo "${title}" nao existe neste endpoint`);
    }
    if (vistos.has(title)) {
      throw new ItemValidationError(`Campo duplicado no payload: ${title}`);
    }
    vistos.add(title);

    const value = item?.value;
    const tipo = declarados.get(title)!;

    if (value === null || value === undefined) {
      aprovados.push({ title, value: null });
      continue;
    }

    if (typeof value === "object") {
      throw new ItemValidationError(`Campo "${title}" nao aceita objetos ou listas`);
    }

    const texto = String(value);
    const tamanho = bytes(texto);

    if (tamanho > MAX_FIELD_BYTES) {
      throw new ItemValidationError(
        `Campo "${title}" excede o limite de ${Math.floor(MAX_FIELD_BYTES / 1024)}KB`,
        413,
      );
    }

    if (tipo === "img") {
      validarImagemBase64(title, texto);
    } else if (typeof value === "string" && texto.length > MAX_TEXT_LENGTH) {
      throw new ItemValidationError(
        `Campo "${title}" excede ${MAX_TEXT_LENGTH} caracteres`,
        413,
      );
    }

    if (tipo === "number" && texto && !/^-?\d+([.,]\d+)?$/.test(texto)) {
      throw new ItemValidationError(`Campo "${title}" deve ser numerico`);
    }

    total += tamanho + bytes(title);
    aprovados.push({ title, value });
  }

  if (total > MAX_ITEM_BYTES) {
    throw new ItemValidationError(
      `O registro excede o limite de ${Math.floor(MAX_ITEM_BYTES / 1024)}KB`,
      413,
    );
  }

  return aprovados;
}

/**
 * Campos de imagem chegam como data URL base64 (o upload e feito pelo proprio documento,
 * nao por Storage). Aceitamos apenas tipos de imagem conhecidos: sem isso daria para
 * gravar `data:text/html,<script>` e servi-lo pela API publica.
 */
const TIPOS_DE_IMAGEM = ["image/webp", "image/png", "image/jpeg", "image/gif", "image/avif"];

function validarImagemBase64(title: string, valor: string) {
  if (!valor) return;

  // Tambem aceita URL http(s), caso a midia passe a ser externa no futuro.
  if (/^https?:\/\//i.test(valor)) return;

  const match = /^data:([a-z0-9.+/-]+);base64,/i.exec(valor);
  if (!match) {
    throw new ItemValidationError(
      `Campo "${title}" deve ser uma imagem em base64 (data URL) ou uma URL http(s)`,
    );
  }

  if (!TIPOS_DE_IMAGEM.includes(match[1].toLowerCase())) {
    throw new ItemValidationError(
      `Campo "${title}": tipo de imagem nao permitido (${match[1]})`,
    );
  }
}
