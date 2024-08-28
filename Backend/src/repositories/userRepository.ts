import { db } from '../config/firebaseConfig';

const getHistoryData = async (plate: string, limit: number) => {
  const firestoreHistoryRef = db
    .collection('user')
    .doc(plate)
    .collection('history')
    .orderBy('time_in')
    .limit(limit);

  const querySnapshot = await firestoreHistoryRef.get();
  if (querySnapshot.empty) {
    return [];
  }

  const historyData = querySnapshot.docs.map((doc) => doc.data());

  return historyData;
};

const getPaymentStatusData = async (plate: string) => {
  
  try {
    const userDocRef = db.collection('user').doc(plate);

    const docSnapshot = await userDocRef.get();

    if (!docSnapshot.exists) {
      return null;
    }

    const userData = docSnapshot.data();
    if (!userData) {
      return null;
    }

    const paymentStatusData = userData.paidStatus;

    return paymentStatusData;
  } catch (error) {
    return null;
  }
};

const getPaymentData = async (plate: string) => {
  try {

    const userDocRef = db.collection('user').doc(plate);
    const docSnapshot = await userDocRef.get();
    const userData = docSnapshot.data();
    if (!userData) {
      return null;
    }

    const paymentStatusData = userData.currently_in;
    const locationDocRef = db.collection('location').doc(paymentStatusData[0]);
    const locationData = (await locationDocRef.get()).data();
    if (!locationData) {
      return null;
    }

    const minutesElapsed = Math.round(
      (new Date().getTime() - new Date(paymentStatusData[1]).getTime()) /
        (1000 * 60)
    );
    let amountDue = 0;
    if (locationData.free_on_minutes < minutesElapsed) {
      amountDue = locationData.paid_per_hour * minutesElapsed;
    }
    return {
      location: paymentStatusData[0],
      time_in: paymentStatusData[1],
      incoming_paid: amountDue,
    };
  } catch (error) {
    return null;
  }
};

const payBills = async (plate: string, paid: number) => {
  try {
    const userDocRef = db.collection('user').doc(plate);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.error(`Document for plate ${plate} does not exist.`);
      return false;
    }

    const userData = userDoc.data();
    const currentlyInArray = userData?.currently_in || [];
    currentlyInArray[2] = paid;
    userDocRef.update({
      currently_in: currentlyInArray,
      paidStatus: true,
    });
    return true;
  } catch (error) {
    return null;
  }
};

export { getHistoryData, getPaymentStatusData, getPaymentData, payBills };
