import jwt from "jsonwebtoken";

/**
 * Verifica a autenticidade de um token JWT.
 * @param token Token JWT fornecido
 * @returns Retorna `true` se o token for válido, caso contrário, `false`
 */
const verifyToken = async (token: string): Promise<boolean> => {

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY||"");
      return !!decoded;
    } catch (error) {
      return false; // Token inválido ou expirado
    }
  };

export default verifyToken