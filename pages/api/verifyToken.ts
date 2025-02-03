import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../services/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;

  // Verifica se o cabeçalho Authorization existe e se segue o formato Bearer Token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Extrai o token após "Bearer "
  const token = authHeader.split(" ")[1];

  // Verifica se o token é válido
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  return res.status(200).json({ valid: true, user: decoded });
}
