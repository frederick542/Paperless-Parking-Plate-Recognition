import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import adminRoutes from './routes/adminRoutes';
import multer from 'multer';
import parkManagementController from './controllers/parkManagementController';
import userRoutes from './routes/userRoutes';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { setupWebSocketServer } from './config/websocketConfig';

const upload = multer({ dest: 'uploads/cache/' });
const port = 3000;
const app = express();
const server = http.createServer(app);

const corsOptions: CorsOptions = {
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204, 
};

app.use(cookieParser())
app.use(express.json());
app.use(cors(corsOptions));
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.post(
  '/readPlate',
  upload.single('file'),
  parkManagementController.postPlate
);

setupWebSocketServer(server); 

server.listen(port, () => {
  console.log(`now listening on localhost:${port}`);
});
