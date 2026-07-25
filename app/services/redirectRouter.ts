import { adminApi } from "@/app/services/adminApi";

/** Volta para /home quando a rota acessada nao corresponde a nenhum endpoint. */
export const redirectRouter = async (endpointId: string) => {
  if (!endpointId) {
    redirectToHome();
    return;
  }

  try {
    const response = await adminApi.endpoints.list();
    const existe = (response?.data || []).some((endpoint: any) => endpoint.title === endpointId);
    if (!existe) redirectToHome();
  } catch (error) {
    console.error("Erro ao buscar endpoints:", error);
    redirectToHome();
  }
};

const redirectToHome = () => {
  window.location.href = "/home";
};
