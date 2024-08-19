import { getUrl, storageBucket, db } from '../config/firebaseConfig';

const uploadPlatePicture = async (
  file: Express.Multer.File,
  destinationPath: string
): Promise<void> => {
  try {
    await storageBucket.upload(file.path, {
      destination: destinationPath,
      metadata: {
        contentType: file.mimetype,
      },
    });
  } catch (error) {
    throw new Error('Failed to upload file');
  }
};

const parkIn = async (
  destinationPath: string,
  location: string,
  plateNumber: string
) => {
  const imageUrl = await getUrl(destinationPath);
  const currentDate = new Date();
  const operation = 'in';
  const locationDocRef = db
    .collection('location')
    .doc(location)
    .collection(operation)
    .doc(plateNumber);

  await locationDocRef.set({
    time_in: currentDate,
    image: imageUrl,
  });

  const userDocRef = db.collection('user').doc(plateNumber);

  await userDocRef.update({
    currently_in: [location, currentDate],
  });
};

const parkOut = async (
  destinationPath: string,
  location: string,
  plateNumber: string
): Promise<string> => {
  const imageUrl = await getUrl(destinationPath);
  const currentDate = new Date().toISOString();

  const [userDocSnap, locationDocSnap] = await Promise.all([
    db.collection('user').doc(plateNumber).get(),
    db.collection('location').doc(location).get(),
  ]);

  if (!userDocSnap.exists || !locationDocSnap.exists) {
    console.log('No such document!');
    return 'No such document!';
  }

  const paidPerHour = locationDocSnap.data()?.paid_per_hour || 0;
  const paidStatus = userDocSnap.data()?.paidStatus || false;
  const time_in = userDocSnap.data()?.currently_in[1];
  const time_out = new Date();

  if (!paidStatus) {
    return 'Not paid, cannot proceed with park out';
  }

  if (!time_in) {
    return 'No valid time_in!';
  }

  const minutesElapsed =
    (time_out.getTime() - time_in.toDate().getTime()) / (1000 * 60);
  const amountDue = paidPerHour * minutesElapsed;

  const userDocRefHistory = userDocSnap.ref
    .collection('history')
    .doc(currentDate);
  const locationDocRef = db
    .collection('location')
    .doc(location)
    .collection('out')
    .doc(`${plateNumber}::${time_out.getTime()}`);
  const locationDocRefIn = db
    .collection('location')
    .doc(location)
    .collection('in')
    .doc(plateNumber);

  const batch = db.batch();

  batch.set(locationDocRef, {
    time_in: time_in,
    time_out: time_out,
    image: imageUrl,
    paid: amountDue,
  });

  batch.set(userDocRefHistory, {
    image_out: imageUrl,
    paid: amountDue,
    time_in: time_in,
    time_out: time_out,
  });

  batch.update(userDocSnap.ref, {
    currently_in: [],
    paidStatus: false,
  });

  batch.delete(locationDocRefIn);
  await batch.commit();
  return 'File uploaded and Succesfuly get out';
};

const pageSize = 10;
const query = async (
  location: string,
  timeIn: string,
  timeOut: string,
  plate_number: string,
  lastVisibleId: FirebaseFirestore.DocumentSnapshot | null
) => {
  let lastVisible = lastVisibleId;
  let query = db
    .collection('location')
    .doc(location)
    .collection('in')
    .orderBy('time_in')
    .limit(pageSize);
  if (lastVisible) {
    query = query.startAfter(lastVisible);
    return;
  }
  try {
    let lastVisible: FirebaseFirestore.DocumentSnapshot | null = null;
    console.log(db
      .collection('location')
      .doc(location)
      .collection('in')
      .doc('B1538BNQ'))
      
  } catch (error) {}
  console.log(location, timeIn, timeOut, plate_number);
};

export { uploadPlatePicture, parkIn, parkOut, query };
