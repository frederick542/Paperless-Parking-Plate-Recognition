import { Router } from 'express';
import authController from '../controllers/authController';
import userController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';

const userRoutes = Router();

userRoutes.post('/register', authController.userRegister);
userRoutes.post('/login', authController.userLogin);
userRoutes.post(
  '/getHistory',
  authMiddleware.verifyTokenUser,
  userController.getHistory
);
userRoutes.post(
  '/getPaymentStatus',
  authMiddleware.verifyTokenUser,
  userController.getPaymentStatus
);
userRoutes.post('/pay', authMiddleware.verifyTokenUser, userController.pay);

export default userRoutes;
