import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { getFilePath, deleteFile } from '../utils/fileManagementUtils';
import WebSocket from 'ws';
import {
  monitorDefault,
  monitorQuery,
  parkIn,
  parkOut,
  updatePlate,
  uploadPlatePicture,
} from '../repositories/parkManagementRepository';
import { v4 as uuidv4 } from 'uuid';
import {
  checkVehicleIn,
  checkVehicleRegistered,
} from '../repositories/authRepository';
import { db } from '../config/firebaseConfig';
import { queryPayload } from '../model/queryPayloadInterface';

const FASTAPI_URL = process.env.FASTAPI_URL || '';

const postImageToFastAPI = async (
  file: Express.Multer.File,
  operation: string,
  location: string
) => {
  const form = new FormData();
  const filePath = getFilePath(file.path);
  const uniqueFileName = `${uuidv4()}_${file.originalname}`;
  const destinationPath = `${location}/${operation}/${uniqueFileName}`;
  form.append('file', fs.createReadStream(filePath), {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  try {
    const { data } = await axios.post(FASTAPI_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (data.message === 'No license plates detected') {
      return {
        status: 406,
        data: { message: 'No license plates detected' },
      };
    }

    if (!['in', 'out', 'register'].includes(operation)) {
      return {
        status: 400,
        data: { message: 'Invalid operation' },
      };
    }

    const license_plate = data.license_plate;

    if (!(await checkVehicleRegistered(license_plate))) {
      return {
        status: 401,
        data: { message: 'Account does not exist' },
      };
    }

    let text: string = 'File uploaded and Firestore updated successfully';
    if (operation == 'in') {
      await uploadPlatePicture(file, destinationPath);
      await parkIn(destinationPath, location, license_plate);
    } else if (operation == 'out') {
      if (!(await checkVehicleIn(location, license_plate))) {
        return {
          status: 404,
          data: { message: 'no data in parked in' },
        };
      }

      await uploadPlatePicture(file, destinationPath);
      text = await parkOut(destinationPath, location, license_plate);
    } else if (operation == 'register') {
      return {
        status: 200,
        data: { yourPlate: license_plate },
      };
    }
    return {
      status: 200,
      data: { message: text },
    };
  } catch (error) {
    console.error('Error processing file upload:', error);
    return {
      status: 500,
      data: { message: 'An error occurred while processing the request' },
    };
  } finally {
    deleteFile(filePath);
  }
};

const handleChangePlateNumber = async (
  plateBefore: string,
  plateAfter: string,
  location: string
) => {
  try {
    await updatePlate(plateBefore, plateAfter, location);
    return {
      status: 200,
      message: 'Updated Succesfuly',
    };
  } catch (error) {
    return {
      status: 400,
      message: 'Check your input again',
    };
  }
};

const increment = 5;
let pageSize = 10;
const handleMonitorRealTimeData = async (
  ws: WebSocket,
  location: string,
  data: queryPayload
) => {
  const type: string = data.type;
  if (data.payload.operation == 'foward') {
    pageSize += increment;
  } else {
    pageSize = increment;
  }
  if (type == 'default') {
    const vehiclesRef = db
    .collection('location')
    .doc(location)
    .collection('in')
    .orderBy('time_in', 'desc')
    .limit(pageSize);
    
    monitorDefault(vehiclesRef, ws);
  } else if (type == 'query') {
    const vehiclesRefQuery = db
      .collection('location')
      .doc(location)
      .collection('in')
      .orderBy('time_in', 'desc')
      .limit(pageSize);
    monitorQuery(
      ws,
      vehiclesRefQuery,
      data.payload.timeInLowerLimit,
      data.payload.timeInUpperLimit,
      data.payload.plateNumber,
    );
  } else {
    ws.send([]);
  }
};

export {
  postImageToFastAPI,
  handleChangePlateNumber,
  handleMonitorRealTimeData,
};
