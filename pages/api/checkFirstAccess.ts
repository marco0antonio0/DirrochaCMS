import { NextApiRequest, NextApiResponse } from 'next';
import { getData } from '../../services/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = getData();
  res.status(200).json({ firstAccess: !user });
}
