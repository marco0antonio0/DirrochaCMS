import { getData, saveData } from "./storage";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET_KEY = "lA0qUhYC0MnzpZ8abcdefghij12345678901234567890"; // Chave secreta
const SALT_ROUNDS = 10; // Número de rounds para a criptografia

/**
 * Registra um novo usuário, criptografa a senha e gera um token JWT.
 * @param name Nome do usuário
 * @param password Senha do usuário
 * @returns Token JWT
 */
export const registerUser = async (name: string, password: string): Promise<string> => {
  const existingUser = await getData();
  if (existingUser) {
    throw new Error("Registration is closed");
  }

  // Criptografa a senha antes de armazená-la
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Salva o usuário com a senha criptografada
  await saveData({ name, password: hashedPassword });

  try {
    // Gera um token JWT com o nome do usuário e tempo de expiração de 1 dia
    const token = jwt.sign({ name }, SECRET_KEY, { expiresIn: "1d" });

    // Salva o token nos cookies por 1 dia
    Cookies.set("token", token, { expires: 1 });

    return token;
  } catch (error) {
    throw new Error("Erro ao gerar token");
  }
};

/**
 * Realiza o login do usuário, verifica a senha criptografada e retorna um token JWT válido.
 * @param name Nome do usuário
 * @param password Senha do usuário
 * @returns Token JWT
 */
export const loginUser = async (name: string, password: string): Promise<string> => {
  const user: any = await getData();

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  // Verifica se a senha fornecida corresponde à senha criptografada
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Credenciais inválidas");
  }

  // Gera um novo token JWT ao logar
  const token = jwt.sign({ name }, SECRET_KEY, { expiresIn: "1d" });

  // Salva o token nos cookies
  Cookies.set("token", token, { expires: 1 });

  return token;
};

/**
 * Verifica a autenticidade de um token JWT.
 * @param token Token JWT fornecido
 * @returns Retorna `true` se o token for válido, caso contrário, `false`
 */
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return !!decoded;
  } catch (error) {
    return false; // Token inválido ou expirado
  }
};
