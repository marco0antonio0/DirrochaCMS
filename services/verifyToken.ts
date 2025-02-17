import jwt from "jsonwebtoken";

/**
 * Verifica a autenticidade de um token JWT.
 * @param token Token JWT fornecido
 * @returns Retorna `true` se o token for válido, caso contrário, `false`
 */
const verifyToken = async (token: string): Promise<boolean> => {
    const _SECRET_KEY = "lA0qUhYC0MnzpZ8abcdefghij12345678901234567890"; // Chave secreta

    try {
      const decoded = jwt.verify(token, _SECRET_KEY);
      return !!decoded;
    } catch (error) {
      return false; // Token inválido ou expirado
    }
  };

export default verifyToken