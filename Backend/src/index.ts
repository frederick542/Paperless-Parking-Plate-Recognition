import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import adminRoutes from './routes/adminRoutes';

const port = 3000;
const app = express();

app.use(express.json());
app.use('/admin', adminRoutes);

app.listen(port, () => {
  console.log(`now listening on localhost:${port}`);
});
