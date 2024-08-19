import { Request, Response } from 'express';
import { postImageToFastAPI } from '../services/plateService';
import { query } from '../repositories/parkManagementRepository';
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
  const { plateNumber = '', timeIn = '', timeOut = '', lasstVisibleId= null} = req.body;
  const location = req.body.location || req.body.user.location;
  if (!location) {
    res.status(400).send('please include required variblee.');
    return;
  }
  const queryResult = await query(
    location,
    timeIn,
    timeOut,
    plateNumber,
    lasstVisibleId
  );
  res.status(404).send('work succesfuly');
};

export default { postPlate, queryVehicle };
