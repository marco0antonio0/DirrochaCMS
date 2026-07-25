import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, verifySessionToken } from "@/backend/common/tokens";
import { sessaoRepository } from "@/backend/sessao/sessao.repository";
import { userRepository } from "@/backend/user/user.repository";
import type { RoleCapabilities, UserRole } from "@/backend/user/user.entity";
import type { Actor } from "@/backend/common/actor";

/**
 * Guard de autorizacao das rotas /api/admin.
 *
 * Esta e a fronteira de seguranca da aplicacao. O middleware apenas redireciona
 * (nao consegue checar revogacao, porque o Admin SDK nao roda em Edge), entao toda
 * decisao real acontece aqui.
 *
 * Ordem das checagens:
 *  1. assinatura e validade do token (jose)
 *  2. sessao existe no Firestore e o hash do token confere  -> revogacao funciona
 *  3. usuario existe e nao esta `disabled`                  -> desativar tem efeito imediato
 *  4. `canManageUsers`, quando a rota exige
 *  5. `Origin` == `Host` em metodos que mudam estado        -> CSRF (o cookie e HttpOnly)
 */

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  capabilities: RoleCapabilities;
}

export interface AuthContext {
  user: AuthedUser;
  /** Atribuicao de autoria derivada do servidor; nunca vem do client. */
  actor: Actor;
  sid: string;
  params: Record<string, string>;
}

type RouteHandler = (req: NextRequest, ctx: AuthContext) => Promise<Response> | Response;

/**
 * O Next 15 valida a assinatura dos route handlers: o segundo argumento precisa ser
 * obrigatorio e `params` uma Promise. Rotas sem segmento dinamico recebem um objeto
 * de params vazio.
 */
interface RouteContext {
  params: Promise<Record<string, string>>;
}

/** Capacidade exigida pela rota. Sem opcao alguma, basta estar autenticado (leitura). */
interface WithAuthOptions {
  require?: keyof RoleCapabilities;
}

const unauthorized = (message = "Nao autenticado") =>
  NextResponse.json({ success: false, error: message }, { status: 401 });

const forbidden = (message = "Sem permissao") =>
  NextResponse.json({ success: false, error: message }, { status: 403 });

const MENSAGEM_SEM_PERMISSAO: Record<keyof RoleCapabilities, string> = {
  read: "Sem permissao para visualizar este recurso",
  write: "Seu perfil nao permite criar ou editar conteudo",
  delete: "Seu perfil nao permite excluir conteudo",
  manageUsers: "Sem permissao para gerenciar contas do painel",
};

/**
 * Verificacao de CSRF.
 *
 * O cookie e HttpOnly e enviado automaticamente pelo browser, o que reintroduz
 * exposicao a CSRF (o modelo anterior, com header Authorization, era imune por
 * acidente). `SameSite=Lax` cobre a maior parte; isto cobre o resto.
 *
 * Duas fontes, porque nenhuma delas sozinha e completa:
 *  - `Sec-Fetch-Site`: enviado por navegadores atuais, distingue same-origin de
 *    cross-site de forma confiavel e nao e forjavel por script.
 *  - `Origin`: fallback para navegadores sem Sec-Fetch-Site.
 *
 * Ausencia das duas indica cliente que nao e navegador (curl, script server-to-server),
 * que nao e vetor de CSRF -- nao existe cookie ambiente para ser abusado.
 */
function isCsrfSafe(req: NextRequest) {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";

  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export function withAuth(handler: RouteHandler, options: WithAuthOptions = {}) {
  return async (req: NextRequest, routeContext: RouteContext) => {
    // CSRF antes de qualquer I/O: uma requisicao cross-site nao deve nem custar
    // leituras no banco.
    if (req.method !== "GET" && req.method !== "HEAD" && !isCsrfSafe(req)) {
      return forbidden("Origem invalida");
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return unauthorized();

    const claims = await verifySessionToken(token);
    if (!claims) return unauthorized("Sessao invalida ou expirada");

    const sessionIsValid = await sessaoRepository.isSessionValid(claims.sid, token);
    if (!sessionIsValid) return unauthorized("Sessao encerrada");

    const user = await userRepository.findAuthUserById(claims.sub);
    if (!user) return unauthorized("Usuario nao encontrado");
    if (user.disabled) return forbidden("Conta desativada");

    if (options.require && !user.capabilities[options.require]) {
      return forbidden(MENSAGEM_SEM_PERMISSAO[options.require]);
    }

    const params = (await routeContext?.params) ?? {};

    return handler(req, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        capabilities: user.capabilities,
      },
      actor: { id: user.id, email: user.email },
      sid: claims.sid,
      params,
    });
  };
}

/** Aplica o cookie de sessao numa resposta. */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
