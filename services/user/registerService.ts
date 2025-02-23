import { userRepository } from '@/repositories/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SessaoService } from '../sessaoService';

export const registerService = {
  async register(email: string, password: string, name: string) {
    const SALT_ROUNDS = 10;
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) throw new Error('Email already registered');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await userRepository.createUser({ email, password: hashedPassword, name });
    
    const token = jwt.sign({ name:email, id: userId }, process.env.SECRET_KEY!, { expiresIn: '1h' });
    const sessaoService = new SessaoService()
    await sessaoService.validateToken({token:token})
    
    return { message: 'User registered successfully', token };
  },
};