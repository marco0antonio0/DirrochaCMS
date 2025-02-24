import { userRepository } from '@/repositories/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SessaoService } from '../sessaoService';
import { SessaoRepository } from '@/repositories/sessaoRepository';
import createHttpError from 'http-errors';
import verifyToken from '../verifyToken';

export const logoutService = {
  async logout(token:string) {
    try {
      const isValidToken = verifyToken(token)
      if(!isValidToken){ return null}
      const tokenDecoded:any = jwt.decode(token)
      const sessaoRepository = new SessaoRepository()
      const sessao:any = await sessaoRepository.getSessaoByEmail(tokenDecoded.name)
      const token_db = sessao.data.token
      if(token === token_db){
        sessaoRepository.deleteSessao(tokenDecoded.name)
      }
      return { status:200, message: 'Logout successful', token };
    } catch (error) {
      // throw new createHttpError.Unauthorized('Token inválido ou revogado');
      console.log("erro aqui")
    }
  },
};