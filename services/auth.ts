import jwt from 'jsonwebtoken';
import { getData, saveData } from './storage';

const SECRET_KEY = 'lA0qUhYC0MnzpZ8';

export const registerUser = async(name: string, password: string) => {
  const data = await getData();
  if (data) {
    throw new Error('Registration is closed');
  }
  saveData({ name, password });
};

export const loginUser = async(name: string, password: string) => {
  const user:any = await getData();
  // var data = user['config']['data']
  if (!user || user.name !== name || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  return jwt.sign({ name }, SECRET_KEY!, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY!);
  } catch {
    return null;
  }
};