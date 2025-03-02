import { SessaoRepository } from "@/repositories/sessaoRepository";
import verifyToken from "@/services/verifyToken";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;

  // Verifica se o cabeçalho Authorization existe e se segue o formato Bearer Token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Extrai o token após "Bearer "
  const token:any = authHeader.split(" ")[1];
  // Verifica se o token é válido
  const decoded = await verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const sessaoRepository = new SessaoRepository()
  const tokenDecoded:any = jwt.decode(token)
    
  const email = tokenDecoded?.name;
  const existingSessao:any = await sessaoRepository.getSessaoByEmail(email);
  if(existingSessao.success == true){ 
   const token_db = existingSessao.data.token 
   if(token_db != token){ return res.status(401).json({ message: "Unauthorized: Invalid token" });}
  }
  else{ return res.status(401).json({ message: "Unauthorized: Invalid token" }); }

  return res.status(200).json({ valid: true, user: decoded });
}
