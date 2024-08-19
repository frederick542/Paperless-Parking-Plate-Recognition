import { Request, Response } from 'express';
import { postImageToFastAPI } from '../services/plateService';
import { query, updatePlate } from '../repositories/parkManagementRepository';

const postPlate = async (req: Request, res: Response) => {
  const file = req.file;
  const { operation, location } = req.body;

  try {
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }
    if (!operation || !location) {
      return res.status(400).send('please include required variable.');
    }
    const response = await postImageToFastAPI(file, operation, location);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error posting image:', error);
    res.status(500).send('An error occurred while uploading the image.');
  }
};

const queryVehicle = async (req: Request, res: Response) => {
  const {
    plateNumber = '',
    timeInLowerLimit = '',
    timeInUpperLimit = '',
    lastVisibleId = null,
    operation = '',
  } = req.body;
  try {
    const location = req.body.user.location;
    if (!location) {
      res.status(400).send('please include required variblee.');
      return;
    }
    const queryResult = await query(
      location,
      timeInLowerLimit,
      timeInUpperLimit,
      plateNumber,
      lastVisibleId,
      operation
    );
    res.status(200).send(queryResult);
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

const changePlateNumber = async (req: Request, res: Response) => {
  const { plateBefore, plateAfter } = req.body;
  const location = req.body.user.location;
  try {
    await updatePlate(plateBefore, plateAfter, location);
    res.status(200).json({ message: 'Updated Succesfuly' });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Check your input again' });
  }
};

export default { postPlate, queryVehicle, changePlateNumber };
