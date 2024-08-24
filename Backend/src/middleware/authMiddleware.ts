import { Admin } from './../model/adminInterface';
import { Request, Response, NextFunction } from 'express';
import jwtUtils from '../utils/jwtUtils';
import { User } from '../model/userInterface';

const verifyToken =
  (role: 'admin' | 'user') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const payload = JSON.parse(req.cookies.token);
    const token = payload.tokenVal;
    if (!token) {
      res.status(403).json({ message: 'No token provided' });
      return;
    }

    try {
      let decoded = jwtUtils.verifyToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }
      if (role === 'admin') {
        req.body.user = decoded as Admin;
      } else if (role === 'user') {
        req.body.user = decoded as User;
      }
      next();
    } catch (err) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

const verifyCookie = (req: Request, res: Response): void => {
  const token = JSON.parse(req.cookies['token']);
  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return;
  }
  try {
    let decoded = jwtUtils.verifyToken(token.tokenVal);
    if (!decoded) {
      res.status(403).json({ message: 'No token provided' });
      return;
    }
    res.status(200).json({ message: 'Authorized' });
    return;
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const verifyTokenAdmin = verifyToken('admin');
const verifyTokenUser = verifyToken('user');
export default { verifyTokenAdmin, verifyTokenUser, verifyCookie };
