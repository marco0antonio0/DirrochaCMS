import { NextResponse } from "next/server";

/**
 * Converte um erro numa resposta JSON.
 *
 * Erros com `status` (AuthError, UserServiceError) sao esperados e a mensagem pode ir
 * para o cliente. Qualquer outro e inesperado: registra no servidor e devolve uma
 * mensagem genérica, para nao vazar detalhe de implementacao.
 */
export function toErrorResponse(error: unknown, fallbackMessage = "Erro inesperado") {
  const status = typeof (error as any)?.status === "number" ? (error as any).status : 500;

  if (status >= 500) {
    console.error(fallbackMessage, error);
    return NextResponse.json({ success: false, error: fallbackMessage }, { status });
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ success: false, error: message }, { status });
}
