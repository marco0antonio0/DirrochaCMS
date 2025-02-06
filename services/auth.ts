import { getData, saveData } from './storage';
import Cookies from "js-cookie";
import { SignJWT, jwtVerify } from 'jose';
import { createSecretKey } from 'crypto';



export const registerUser = async (name: string, password: string): Promise<string> => {
const _SECRET_KEY_ = 'lA0qUhYC0MnzpZ8abcdefghij12345678901234567890';
  const data = await getData();
  if (data) {
    throw new Error('Registration is closed');
  }
  
  await saveData({ name, password });
  try {
    const token = _SECRET_KEY_
    Cookies.set("token", token, { expires: 1 });

    return token;
  } catch (error) {
    throw new Error('Erro ao gerar token');
  }
};


export const loginUser = async(name: string, password: string) => {
const _SECRET_KEY_ = 'lA0qUhYC0MnzpZ8abcdefghij12345678901234567890';
  const user:any = await getData();
  // var data = user['config']['data']
  if (!user || user.name !== name || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  return _SECRET_KEY_
};

export const verifyToken = async (token: string) => {
  const _SECRET_KEY_ = 'lA0qUhYC0MnzpZ8abcdefghij12345678901234567890';
  return _SECRET_KEY_ === token
};