// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getEndpoints } from "@/services/getEndpoints";
import { getItemsByEndpoint } from "@/services/getItensToEndpoints";
import type { NextApiRequest, NextApiResponse } from "next";



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const {id} = req.query
  if(!id){
    return res.status(400).json({ error: "Parâmetro não informado" ,statusCode:400});
  }
  var endpoints = await getEndpoints()
  var listEndpoints = endpoints['data']?.map((e:any)=>e.title)
  if(!listEndpoints?.includes(id)){
    return res.status(404).json({ error: "Endpoint inexistente",statusCode:404 });
  }
  var item:any = endpoints['data']
  var data = await getItemsByEndpoint(item[0]['id'])
  if(!data['data']){
    return res.status(500).json({ error: "Error interno",statusCode:500 });
  }
  res.status(200).json({ data: data['data'],statusCode:200 });
}
