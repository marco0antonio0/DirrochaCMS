import "server-only";

/**
 * Politica de senha.
 *
 * O minimo anterior era 6 caracteres, o que combinado com a ausencia de rate limiting
 * tornava forca bruta viavel. O comprimento e a defesa mais eficaz aqui, por isso o
 * minimo subiu para 10 -- sem exigir simbolos, que empurram o usuario para padroes
 * previsiveis do tipo "Senha1!" e para anotar a senha em outro lugar.
 */

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 200; // bcrypt trunca em 72 bytes; alem disso e so custo

/**
 * Senhas obvias e variacoes comuns em portugues e ingles. Nao substitui uma lista
 * completa (tipo a do rockyou), mas barra o que aparece de fato num painel interno.
 */
const SENHAS_PROIBIDAS = new Set([
  "senha", "senha123", "senha1234", "senhasenha", "minhasenha",
  "password", "password1", "password123", "passw0rd", "p@ssword", "p@ssw0rd",
  "123456", "1234567", "12345678", "123456789", "1234567890", "12345678910",
  "qwerty", "qwerty123", "qwertyuiop", "asdfghjkl", "1q2w3e4r", "1qaz2wsx",
  "admin", "admin123", "administrador", "administrator", "root", "toor",
  "abc123", "abcd1234", "letmein", "welcome", "welcome1", "iloveyou",
  "dirrocha", "dirrochacms", "cms123", "teste", "teste123", "test1234",
  "brasil", "brasil123", "futebol", "flamengo", "corinthians",
]);

export interface PasswordCheck {
  ok: boolean;
  error?: string;
}

export function validatePassword(password: unknown): PasswordCheck {
  if (typeof password !== "string" || !password) {
    return { ok: false, error: "Informe uma senha" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, error: `A senha deve ter no maximo ${MAX_PASSWORD_LENGTH} caracteres` };
  }

  const normalizada = password.trim().toLowerCase();

  if (SENHAS_PROIBIDAS.has(normalizada)) {
    return { ok: false, error: "Essa senha e muito comum. Escolha outra." };
  }

  // "senha123456" tambem precisa cair: prefixo obvio + digitos.
  const semDigitosFinais = normalizada.replace(/\d+$/, "");
  if (semDigitosFinais.length >= 4 && SENHAS_PROIBIDAS.has(semDigitosFinais)) {
    return { ok: false, error: "Essa senha e muito comum. Escolha outra." };
  }

  if (/^(.)\1+$/.test(normalizada)) {
    return { ok: false, error: "A senha nao pode ser um unico caractere repetido" };
  }

  if (new Set(normalizada).size < 5) {
    return { ok: false, error: "A senha precisa ter mais variedade de caracteres" };
  }

  return { ok: true };
}
