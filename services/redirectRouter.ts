import { useRouter } from "next/router";
import { getEndpoints } from "./getEndpoints";

export const redirectRouter = async (r:any) => {
    if (r.query.id) {
      try {
        const fetch: any = await getEndpoints();
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
    window.location.href = "/home"; // ou use o roteador do seu framework, ex: next/router
  };
  
//   const authRoute = async (queryId) => {
//     try {
//       const fetch: any = await getEndpoints();
//       const isAuthorized = fetch.data.some((e: any) => e.title === queryId);
      
//       if (!isAuthorized) {
//         redirectTo404();
//       }
//     } catch (error) {
//       console.error("Erro na autenticação da rota:", error);
//       redirectTo404();
//     }
//   };