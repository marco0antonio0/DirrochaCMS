import { userRepository } from '@/repositories/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginService = {
  async login(email: string, password: string) {
    const _SECRET_KEY = "lA0qUhYC0MnzpZ8abcdefghij12345678901234567890";
    const user = await userRepository.findUserByEmail(email);
    if (!user) throw new Error('User not found');
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');
    
    const token = jwt.sign({ email: user.email, id: user.id }, _SECRET_KEY, { expiresIn: '1h' });
    
    return { message: 'Login successful', token };
  },
};