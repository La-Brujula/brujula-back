import { IAccount, IJwtToken } from '@/models/authentication/authentication';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export function hashPassword(username: string, password: string) {
  return crypto.createHash('sha256').update(username).update(password).digest('hex');
}

export function generateToken(user: IAccount, tokenSecret: string): string {
  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
    } as IJwtToken,
    tokenSecret,
    {
      expiresIn: '1h',
    }
  );
  return token;
}

export function decodeToken(token: string, tokenSecret: string) {
  const decodedToken = jwt.verify(token, tokenSecret);
  if (typeof decodedToken == 'string') throw Error();

  return decodedToken as IJwtToken;
}