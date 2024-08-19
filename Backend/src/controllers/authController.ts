import { Request, Response } from 'express';
import { loginAdmin } from '../services/authService';

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const token = await loginAdmin(username, password);
    res.json(token);
  } catch (error: any) {
    if (error.message === 'Invalid username or password') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server Error', error });
    }
  }
};

export default { login };
