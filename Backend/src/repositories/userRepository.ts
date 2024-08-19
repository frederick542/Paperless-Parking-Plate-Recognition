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
    return null;
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
    const minutesElapsed =
      (new Date().getTime() - new Date(paymentStatusData[1]).getTime()) /
      (1000 * 60);
    const amountDue = locationData.paid_per_hour * minutesElapsed;
    return {
      lcoation: paymentStatusData[0],
      time_in: paymentStatusData[1],
      incoming_paid: amountDue,
    };
  } catch (error) {
    return null;
  }
};

const paid = async (plate: string) => {
  try {
    const userDocRef = db.collection('user').doc(plate);

    userDocRef.update({
      paidStatus:true
    });
    return true
  } catch (error) {
    return null;
  }
};

export { getHistoryData, getPaymentStatusData, getPaymentData, paid };
