import { Router } from 'express';
import parkManagementController from '../controllers/parkManagementController';
import authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const adminRoutes = Router();

adminRoutes.post('/login', authController.adminLogin);

adminRoutes.post(
  '/queryParking',
  authMiddleware.verifyTokenAdmin,
  parkManagementController.queryVehicle
);

adminRoutes.post(
  '/changePlate',
  authMiddleware.verifyTokenAdmin,
  parkManagementController.changePlateNumber
);

export default adminRoutes;
