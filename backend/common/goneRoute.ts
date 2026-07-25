import { NextResponse } from "next/server";

/**
 * Stub 410 para rotas de autenticacao removidas.
 *
 * Estes caminhos precisam continuar existindo como segmentos estaticos: sem eles,
 * `/api/login` cairia na rota dinamica `app/api/[id]` e seria interpretado como um
 * endpoint publico chamado "login".
 */
export function goneRoute(replacement: string) {
  const handler = () =>
    NextResponse.json(
      {
        success: false,
        error: `Rota removida. Use ${replacement}.`,
      },
      { status: 410 },
    );

  return handler;
}
