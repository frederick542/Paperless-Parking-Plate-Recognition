import { Admin } from './../model/adminInterface';
import { Request, Response, NextFunction } from 'express';
import jwtUtils from '../utils/jwtUtils';

const verifyTokenAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwtUtils.verifyToken(token) as Admin;
    req.body.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default {verifyTokenAdmin}