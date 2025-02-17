import { userRepository } from '@/repositories/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerService = {
  async register(email: string, password: string, name: string) {
    const SALT_ROUNDS = 10;
    const _SECRET_KEY = "lA0qUhYC0MnzpZ8abcdefghij12345678901234567890";
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await userRepository.createUser({ email, password: hashedPassword, name });
    
    const token = jwt.sign({ email, id: userId }, _SECRET_KEY, { expiresIn: '1h' });
    
    return { message: 'User registered successfully', token };
  },
};