import { getData, saveData } from "./storage";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";



/**
 * Registra um novo usuário, criptografa a senha e gera um token JWT.
 * @param name Nome do usuário
 * @param password Senha do usuário
 * @returns Token JWT
 */
export const registerUser = async (name: string, password: string): Promise<string> => {
  const _SECRET_KEY = "lA0qUhYC0MnzpZ8abcdefghij12345678901234567890"; // Chave secreta
  const _SALT_ROUNDS = 10; // Número de rounds para a criptografia
  const _existingUser = await getData();
  if (_existingUser) {
    throw new Error("Registration is closed");
  }

  const _hashedPassword = await bcrypt.hash(password, _SALT_ROUNDS);

  await saveData({ name, password: _hashedPassword });

  try {
    const token = jwt.sign({ name }, _SECRET_KEY, { expiresIn: "1d" });

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
  const _SECRET_KEY = "lA0qUhYC0MnzpZ8abcdefghij12345678901234567890";
  const _user: any = await getData();

  if (!_user) {
    throw new Error("Usuário não encontrado");
  }

  const _isPasswordValid = await bcrypt.compare(password, _user.password);
  if (!_isPasswordValid) {
    throw new Error("Credenciais inválidas");
  }

  const token = jwt.sign({ name }, _SECRET_KEY, { expiresIn: "1d" });

  Cookies.set("token", token, { expires: 1 });

  return token;
};



