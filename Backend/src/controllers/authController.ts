import { Request, Response } from 'express';
import {
  handleAdminLogin,
  handleUserLogin,
  handleUserRegister,
} from '../services/authService';

const adminLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const token = await handleAdminLogin(username, password);
    res.cookie('token', JSON.stringify(token), {
      httpOnly: true,
      maxAge: 86400000,
    });
    res.status(200).json();
  } catch (error: any) {
    if (error.message === 'Invalid username or password') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server Error', error });
    }
  }
};

const userLogin = async (req: Request, res: Response) => {
  const { plate, password } = req.body;
  try {
    const token = await handleUserLogin(plate, password);
    res.cookie('token', JSON.stringify(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });
    res.status(200).json({ status: 200 });
  } catch (error: any) {
    if (error.message === 'Invalid username or password') {
      res.status(401).json({  message: error.message });
    } else {
      res.status(500).json({ message: 'Server Error', error });
    }
  }
};

const userRegister = async (req: Request, res: Response) => {
  const { username, password, plate } = req.body;
  try {
    if (!username || !password || !plate) {
      return res.status(400).send('Please fill all requirnment');
    }
    await handleUserRegister(username, password, plate);
    res.status(200).send('Succesfuly registered');
  } catch (error) {
    res.status(400).send('Invalid User');
  }
};

export default { adminLogin, userRegister, userLogin };
