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
  const { email, password } = req.body;
  try {
    const token = await handleUserLogin(email, password);
    res.status(200).json({ data: token, status: 200 });
  } catch (error: any) {
    if (error.message === 'Invalid username or password') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server Error', error });
    }
  }
};

const userRegister = async (req: Request, res: Response) => {
  const { username, password, plate, email } = req.body;
  try {
    if (!username || !password || !plate || !email) {
      return res.status(400).send('Please fill all requirnment');
    }
    const result = await handleUserRegister(username, password, plate, email);

    if(result.status === 'unaccepted'){
      return res.status(400).send({message : result.message});
    }
    res.status(200).send({message : result.message});
  } catch (error) {
    res.status(400).send({ message: 'Unknown Error' });
  }
};

export default { adminLogin, userRegister, userLogin };
