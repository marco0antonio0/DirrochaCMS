import { endpointService } from "./endpointService";

export const redirectRouter = async (r:any) => {
    if (r.query.id) {
      try {
        const fetch: any = await endpointService.listEndpoints();
        const objFormated = fetch.data.filter((e: any) => e.title === r.query.id);
  
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
  