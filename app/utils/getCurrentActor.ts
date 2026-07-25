import Cookies from "js-cookie";
import type { Actor } from "@/backend/common/actor";

export function getCurrentActor(): Actor | null {
  try {
    const token = Cookies.get("token");
    const payload = token?.split(".")[1];
    if (!payload) {
      console.warn("[getCurrentActor] sem cookie 'token' ou payload ausente");
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalizedPayload));
    if (!decoded?.name) {
      console.warn("[getCurrentActor] token decodificado sem name/e-mail:", decoded);
      return null;
    }

    // Tokens emitidos antes do campo `id` existir no payload só têm `name` (e-mail).
    // Usa o e-mail como identificador nesse caso, em vez de invalidar o actor inteiro.
    return { id: decoded.id || decoded.name, email: decoded.name };
  } catch (error) {
    console.warn("[getCurrentActor] falha ao decodificar token:", error);
    return null;
  }
}
