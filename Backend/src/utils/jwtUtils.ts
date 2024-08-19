import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET_KEY || '------';

const generateToken = (payload: any) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
};

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export default { generateToken, verifyToken };
