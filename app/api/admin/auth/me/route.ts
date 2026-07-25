import { NextResponse } from "next/server";
import { withAuth } from "@/backend/common/serverAuth";

/**
 * Identidade e permissoes do usuario da sessao.
 *
 * Substitui `/api/verifyToken` e o antigo `getCurrentActor`, que decodificava o JWT no
 * browser sem verificar assinatura. Como o cookie agora e HttpOnly, esta rota e a
 * unica forma do client saber quem esta logado.
 */
export const GET = withAuth(async (_request, { user }) =>
  NextResponse.json({ success: true, user }),
);
