import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import adminRoutes from './routes/adminRoutes';
import multer from 'multer';
import parkManagementController from './controllers/parkManagementController';
import userRoutes from './routes/userRoutes';

const upload = multer({ dest: 'uploads/cache/' });
const port = 3000;
const app = express();

app.use(express.json());
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.post(
  '/readPlate',
  upload.single('file'),
  parkManagementController.postPlate
);

app.listen(port, () => {
  console.log(`now listening on localhost:${port}`);
});
