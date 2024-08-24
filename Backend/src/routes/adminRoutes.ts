import { Router } from 'express';
import parkManagementController from '../controllers/parkManagementController';
import authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const adminRoutes = Router();

adminRoutes.post('/login', authController.adminLogin);

adminRoutes.post(
  '/changePlate',
  authMiddleware.verifyTokenAdmin,
  parkManagementController.changePlateNumber
);
adminRoutes.post('/verifyCookie', authMiddleware.verifyCookie);

export default adminRoutes;
