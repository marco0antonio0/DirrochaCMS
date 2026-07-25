import "server-only";
import { create as createAltcha, CappedMap, randomInt } from "altcha-lib/frameworks/nextjs";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";

const secret = process.env.SECRET_KEY || "dirrocha-cms-local-altcha-secret";
const usedChallenges = new CappedMap<string, boolean>({ maxSize: 10000 });

export class CaptchaError extends Error {
  readonly status = 403;

  constructor(message = "Verificação anti-bot inválida") {
    super(message);
  }
}

export const altcha = createAltcha({
  hmacSignatureSecret: `${secret}:altcha-signature`,
  hmacKeySignatureSecret: `${secret}:altcha-key`,
  deriveKey,
  store: usedChallenges,
  createChallengeParameters: () => ({
    algorithm: "PBKDF2/SHA-256",
    cost: 750,
    counter: randomInt(250, 80),
    expiresAt: Math.floor(Date.now() / 1000) + 10 * 60,
  }),
});

export async function verifyCaptchaPayload(payload: unknown) {
  const result = await altcha.verify(
    payload,
    deriveKey,
    `${secret}:altcha-signature`,
    `${secret}:altcha-key`,
    usedChallenges,
  );

  if (result.error) {
    throw new CaptchaError(result.error);
  }
}
