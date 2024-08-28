import {
  getHistoryData,
  getPaymentData,
  getPaymentStatusData,
  payBills,
} from '../repositories/userRepository';

const maxHistory = 10;

const handleHistory = async (plate: string) => {
  return await getHistoryData(plate, maxHistory);
};

const handlePaymentStatus = async (plate: string) => {
  if ((await getPaymentStatusData(plate)) == false) {
    return await getPaymentData(plate);
  }
  return null;
};

const handlePayment = async (plate: string, paid: number) => {

  if (!(await getPaymentStatusData(plate))) {
    return await payBills(plate, paid);
  }
  return null;
};

export { handleHistory, handlePaymentStatus, handlePayment };
