import { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '../../services/auth';
import createHttpError from 'http-errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 🔒 Verifica se a chamada vem do próprio servidor Next.js
  const host = req.headers.host || "";
  const referer = req.headers.referer || "";

  if (!referer.includes(host)) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  try {
    const { name, password } = req.body;
    const token = await loginUser(name, password);
    if(!token){
      throw new createHttpError.Unauthorized('Usuario ou senha Incorretos'); 
    }
    res.status(200).json({ token });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}