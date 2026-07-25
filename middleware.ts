import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/backend/common/tokens";

/**
 * Redireciona visitantes sem sessao para o login, antes de renderizar a pagina.
 *
 * Confere apenas a assinatura do token: checar revogacao exigiria o Admin SDK, que nao
 * roda no runtime Edge. Isto e conveniencia de UX -- a fronteira de seguranca de
 * verdade e o guard `withAuth` nas rotas /api/admin, que valida sessao, conta
 * desativada e permissoes.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const claims = token ? await verifySessionToken(token) : null;

  if (claims) return NextResponse.next();

  const loginUrl = new URL("/", request.url);
  const response = NextResponse.redirect(loginUrl);

  // Evita loop de redirect quando o cookie existe mas esta invalido/expirado.
  if (token) {
    response.cookies.set({ name: SESSION_COOKIE_NAME, value: "", path: "/", maxAge: 0 });
  }

  return response;
}

export const config = {
  matcher: ["/home/:path*", "/configuration", "/create"],
};
