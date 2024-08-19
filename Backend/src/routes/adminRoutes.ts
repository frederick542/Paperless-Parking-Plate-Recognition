import { Router } from 'express';
import parkManagementController from '../controllers/parkManagementController';
import authController from '../controllers/authController';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware';

const adminRoutes = Router();
const upload = multer({ dest: 'uploads/cache/' });
adminRoutes.post('/login', authController.login);
adminRoutes.post(
  '/readPlate',
  upload.single('file'),
  parkManagementController.postPlate
);
adminRoutes.get(
  '/queryParking',
  authMiddleware.verifyTokenAdmin,
  parkManagementController.queryVehicle
);

export default adminRoutes;
