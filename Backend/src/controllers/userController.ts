import { Request, Response } from 'express';
import {
  handleHistory,
  handlePayment,
  handlePaymentStatus,
} from '../services/userService';

const getHistory = async (req: Request, res: Response) => {
  const { user } = req.body;
  let data;
  try {
    data = await handleHistory(user.plate);
  } catch (error) {
    return res.status(404).send('No data found');
  }
  res.status(200).send(data);
};

const getPaymentStatus = async (req: Request, res: Response) => {
  const { user } = req.body;
  let data;
  try {
    data = await handlePaymentStatus(user.plate);
    if (!data) {
      return res.status(200).send('alreadyPaid');
    }
  } catch (error) {
    return res.status(404).send('No data found');
  }
  res.status(200).send(data);
};

const pay = async (req: Request, res: Response) => {
  const { user } = req.body;
  let data;
  try {
    data = await handlePayment(user.plate);
    if (!data) {
      return res.status(200).send('alreadyPaid');
    }
  } catch (error) {
    return res.status(404).send('No data found');
  }
  res.status(200).send(data);
};

export default { getHistory, getPaymentStatus, pay };
