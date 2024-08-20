import { Request, Response } from 'express';
import {
  handleChangePlateNumber,
  handleQueryVehicle,
  postImageToFastAPI,
} from '../services/parkManagementService';

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
  const location = req.body.user.location;
  if (!location) {
    res.status(400).send('please include required variblee.');
    return;
  }
  const result = await handleQueryVehicle(
    plateNumber,
    timeInLowerLimit,
    timeInUpperLimit,
    lastVisibleId,
    operation,
    operation
  );
  res.status(result.status).send(result.result);
};

const changePlateNumber = async (req: Request, res: Response) => {
  const { plateBefore, plateAfter } = req.body;
  const location = req.body.user.location;
  const result = await handleChangePlateNumber(
    plateBefore,
    plateAfter,
    location
  );
  res.status(result.status).json(result.message);
};

export default { postPlate, queryVehicle, changePlateNumber };
