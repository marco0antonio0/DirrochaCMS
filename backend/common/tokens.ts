import { SignJWT, jwtVerify } from "jose";

/**
 * Assinatura e verificacao do token de sessao.
 *
 * Usa `jose` (e nao `jsonwebtoken`) porque roda tanto no runtime Node das rotas
 * quanto no runtime Edge do middleware.
 *
 * Este modulo NAO faz checagem de revogacao: verificar a sessao no Firestore exige
 * o Admin SDK, que nao roda em Edge. A revogacao acontece no guard `withAuth`.
 */

const MIN_SECRET_LENGTH = 32;

export const SESSION_COOKIE_NAME = "token";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 dia

export interface SessionClaims {
  /** id do documento em `users_collections` */
  sub: string;
  email: string;
  /** id do documento de sessao em `sessao_collections`, para revogacao */
  sid: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.SECRET_KEY;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SECRET_KEY ausente ou curta demais (minimo ${MIN_SECRET_LENGTH} caracteres). ` +
        "Gere uma com `openssl rand -base64 48`. Trocar o valor invalida todas as sessoes.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email, sid: claims.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/** Retorna as claims quando assinatura e validade conferem; `null` caso contrario. */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.sid !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email, sid: payload.sid };
  } catch {
    return null;
  }
}
