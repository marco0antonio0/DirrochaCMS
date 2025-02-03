import { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '../../services/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { name, password } = req.body;
    registerUser(name, password);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}