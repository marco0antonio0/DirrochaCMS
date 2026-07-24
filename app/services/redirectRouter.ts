import { endpointService } from "@/backend/endpoint/endpoint.service";

export const redirectRouter = async (endpointId: string) => {
    if (endpointId) {
      try {
        const fetch: any = await endpointService.listEndpoints();
        const objFormated = fetch.data.filter((e: any) => e.title === endpointId);
  
        if (objFormated.length > 0) {
        } else {
          redirectTo404();
        }
      } catch (error) {
        console.error("Erro ao buscar endpoints:", error);
        redirectTo404();
      }
    } else {
      redirectTo404();
    }
  };
  
  const redirectTo404 = () => {
    window.location.href = "/home";
  };
  
