import "server-only";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Acesso ao Firestore pelo servidor, via Admin SDK.
 *
 * O Admin SDK ignora as security rules por design, portanto este modulo e o unico
 * caminho de dados da aplicacao e nunca pode ser importado por um componente client
 * (`server-only` garante isso em tempo de build).
 */

interface ParsedServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function readServiceAccount(): ParsedServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_B64 ausente. Gere uma service account em " +
        "Firebase Console > Project settings > Service accounts e converta o JSON com " +
        "`base64 -w0 arquivo.json`. Veja .env.example.",
    );
  }

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 nao contem um JSON valido em base64.");
  }

  for (const field of ["project_id", "client_email", "private_key"] as const) {
    if (!parsed[field]) {
      throw new Error(`Service account invalida: campo "${field}" ausente.`);
    }
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  };
}

const serviceAccount = readServiceAccount();

// getApps() garante idempotencia entre hot reloads do dev server.
const adminApp = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });

export const adminDb = getFirestore(adminApp);
export const adminProjectId = serviceAccount.projectId;

// Payloads vindos de JSON frequentemente trazem chaves com `undefined`; sem isso o
// Admin SDK lanca em vez de simplesmente omitir o campo.
try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {
  // settings() so pode ser chamado antes da primeira operacao; em hot reload o
  // modulo pode reexecutar depois disso, e o valor ja esta aplicado.
}
