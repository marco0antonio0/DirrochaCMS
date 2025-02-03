import { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '../../services/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { name, password } = req.body;
    const token = loginUser(name, password);
    res.status(200).json({ token });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}