// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getEndpoints } from "@/services/getEndpoints";
import { getItemsByEndpoint } from "@/services/getItensToEndpoints";
import type { NextApiRequest, NextApiResponse } from "next";

const searchByTituloIdentificador = (data: any, searchTerm: string) => {
  if (!data || !data.data || data.data.length === 0) {
    return { error: "Nenhum dado encontrado", statusCode: 404 };
  }

  // Filtra os itens que possuem o título correspondente
  const results = data.data.filter((item: any) => {
    return item.formattedData.titulo_identificador === searchTerm;
  });

  if (results.length === 0) {
    return { error: "Nenhum resultado encontrado", statusCode: 404 };
  }

  return { data: results, statusCode: 200 };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  res.setHeader("Access-Control-Allow-Credentials", 'true');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS, PATCH, DELETE, POST, PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  const {id,t} = req.query
  if(!id){
    return res.status(400).json({ error: "Parâmetro não informado" ,statusCode:400});
  }
  var endpoints = await getEndpoints()
  var listEndpoints = endpoints['data']?.map((e:any)=>e.title)
  if(!listEndpoints?.includes(id)){
    return res.status(404).json({ error: "Endpoint inexistente",statusCode:404 });
  }
  var item:any = endpoints['data']
  var idD = Array.isArray(id) ? id[0] : id;
  var idData:any = item.filter((e:any)=>e.router===idD)
  var data = await getItemsByEndpoint(idData[0]['id'])
  if(!data['data']){
    return res.status(500).json({ error: "Error interno",statusCode:500 });
  }

  if(t){
    var item:any = data['data'][0]
    const searchTerm = Array.isArray(t) ? t[0] : t;
    if (!searchTerm) {
      return res.status(400).json({ error: "Parâmetro 't' é obrigatório", statusCode: 400 });
    }
    const searchResults = searchByTituloIdentificador(data, searchTerm);
    return res.status(searchResults.statusCode).json(searchResults);
  }

  return res.status(200).json({ data: data['data'],statusCode:200 });
}
