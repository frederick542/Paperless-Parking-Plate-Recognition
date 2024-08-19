import {
  getHistoryData,
  getPaymentData,
  getPaymentStatusData,
  paid,
} from '../repositories/userRepository';

const maxHistory = 10;

const handleHistory = async (plate: string) => {
  return await getHistoryData(plate, maxHistory);
};

const handlePaymentStatus = async (plate: string) => {
  if (!(await getPaymentStatusData(plate))) {
    return await getPaymentData(plate);
  }
  return null;
};

const handlePayment = async (plate: string) => {
  if (!(await getPaymentStatusData(plate))) {
    return await paid(plate);
  }
  return null;
};

export { handleHistory, handlePaymentStatus, handlePayment };
