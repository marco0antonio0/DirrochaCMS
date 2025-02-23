import { userRepository } from '@/repositories/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SessaoService } from '../sessaoService';

export const loginService = {
  async login(email: string, password: string) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) throw new Error('User not found');
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');
    
    const token = jwt.sign({ name: user.email, id: user.id }, process.env.SECRET_KEY!, { expiresIn: '1h' });
    const sessaoService = new SessaoService()
    await sessaoService.validateToken({token:token})
    
    return { message: 'Login successful', token };
  },
};