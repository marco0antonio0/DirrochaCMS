import jwt from 'jsonwebtoken';
import { getData, saveData } from './storage';

const SECRET_KEY = 'supersecretkey';

export const registerUser = (name: string, password: string) => {
  if (getData()) {
    throw new Error('Registration is closed');
  }
  saveData({ name, password });
};

export const loginUser = (name: string, password: string) => {
  const user = getData();
  if (!user || user.name !== name || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  return jwt.sign({ name }, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    return null;
  }
};