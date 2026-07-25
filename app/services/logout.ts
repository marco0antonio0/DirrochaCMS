import { adminApi } from "@/app/services/adminApi";

/**
 * Encerra a sessao.
 *
 * A versao anterior rodava no browser e tentava validar o JWT com `SECRET_KEY`, que
 * nunca existe no client -- entao a verificacao sempre falhava e o documento de sessao
 * jamais era apagado: o token seguia valido depois do "logout". Agora quem revoga e o
 * servidor, que tambem limpa o cookie.
 */
export async function logout(router: { push: (path: string) => void }) {
  try {
    await adminApi.auth.logout();
  } catch {
    // Sessao ja invalida ou rede fora: seguir para o login de qualquer forma.
  }

  router.push("/");
}
