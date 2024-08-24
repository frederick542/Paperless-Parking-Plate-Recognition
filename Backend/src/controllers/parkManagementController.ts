import { Request, Response } from 'express';
import {
  handleChangePlateNumber,
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

export default {
  postPlate,
  changePlateNumber,
};
