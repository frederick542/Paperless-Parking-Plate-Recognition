import { WebSocket } from 'ws';
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
  const currentDate = new Date().toISOString();
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
  const userDocData = userDocSnap.data();
  const locationDocData = locationDocSnap.data();

  if (
    !userDocSnap.exists ||
    !locationDocSnap.exists ||
    !userDocData ||
    !locationDocData
  ) {
    console.log('No such document!');
    return 'No such document!';
  }

  const paidStatus = userDocData.paidStatus || false;
  const time_in = new Date(userDocData.currently_in[1]);
  const time_out = new Date();
  const minutesElapsed =
    (new Date().getTime() - new Date(time_in).getTime()) / (1000 * 60);
  if (locationDocData.free_on_minutes < minutesElapsed) {
    if (!paidStatus) {
      return 'Not paid, cannot proceed with park out';
    }
  }

  if (!time_in) {
    return 'No valid time_in!';
  }

  const amountDue = userDocData.currently_in[2];

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
  const time_out_string = time_out.toISOString();
  const time_in_string = time_in.toISOString();

  batch.set(locationDocRef, {
    time_in: time_in_string,
    time_out: time_out_string,
    image: imageUrl,
    paid: amountDue,
  });

  batch.set(userDocRefHistory, {
    image_out: imageUrl,
    paid: amountDue,
    time_in: time_in_string,
    time_out: time_out_string,
    location: location,
  });

  batch.update(userDocSnap.ref, {
    currently_in: [],
    paidStatus: false,
  });

  batch.delete(locationDocRefIn);
  await batch.commit();
  return 'File uploaded and Succesfuly get out';
};

const updatePlate = async (
  plateBefore: string,
  plateAfter: string,
  location: string
) => {
  const locationDataRef = db
    .collection('location')
    .doc(location)
    .collection('in');
  const prefUser = db.collection('user').doc(plateBefore);
  const afterUser = db.collection('user').doc(plateAfter);

  await db.runTransaction(async (transaction) => {
    const docRef = locationDataRef.doc(plateBefore);
    const docSnapshot = await transaction.get(docRef);

    if (!docSnapshot.exists) {
      throw new Error('No document found with plateBefore.');
    }

    const prefUserDoc = await transaction.get(prefUser);
    const prefUserData = prefUserDoc.data();

    if (!prefUserData) {
      throw new Error('No user data found for plateBefore.');
    }

    const currentlyIn = prefUserData.currently_in || [];

    transaction.delete(docRef);

    transaction.set(locationDataRef.doc(plateAfter), {
      ...docSnapshot.data(),
      plate: plateAfter,
    });

    transaction.update(prefUser, { currently_in: [] });
    transaction.update(afterUser, { currently_in: currentlyIn });
  });

  console.log('Plate updated successfully.');
};

const monitorDefault = (
  firestoreQuery: FirebaseFirestore.Query<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  ws: WebSocket
) => {
  firestoreQuery.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        const vehicleData = change.doc;
        ws.send(
          JSON.stringify({
            data: {
              plateNumber: vehicleData.id,
              ...vehicleData.data(),
            },
            type: 'update',
          })
        );
      } else if (change.type === 'added' || change.type === 'removed') {
        const initialData = snapshot.docs.map((doc) => ({
          plateNumber: doc.id,
          ...doc.data(),
        }));
        ws.send(
          JSON.stringify({
            type: 'add/remove',
            data: initialData,
          })
        );
      }
    });
  });
};

const monitorQuery = async (
  ws: WebSocket,
  firestoreQuery: FirebaseFirestore.Query<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  timeInLowerLimit: Date | undefined,
  timeInUpperLimit: Date | undefined,
  plateNumber: string = ''
) => {
  if (timeInLowerLimit && !timeInUpperLimit) {
    timeInUpperLimit = new Date(timeInLowerLimit);
    timeInUpperLimit.setHours(23, 59, 59, 999);
  } else if (!timeInLowerLimit && timeInUpperLimit) {
    timeInLowerLimit = new Date(timeInUpperLimit);
    timeInLowerLimit.setHours(0, 0, 0, 0);
  }
  if (timeInLowerLimit) {
    firestoreQuery = firestoreQuery.where('time_in', '>=', timeInLowerLimit);
  }

  if (timeInUpperLimit) {
    firestoreQuery = firestoreQuery.where('time_in', '<=', timeInUpperLimit);
  }

  firestoreQuery.onSnapshot((snapshot) => {
    if (snapshot.empty) {
      ws.send([]);
    }
    snapshot.docChanges().forEach((change) => {
      const firstDocId = snapshot.docs.length > 0 ? snapshot.docs[0].id : null;

      const lastDocId =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1].id
          : null;
      if (change.type === 'modified') {
        const vehicleData = change.doc;
        if (plateNumber) {
          if (!plateNumber || vehicleData.id === plateNumber) {
            ws.send(
              JSON.stringify({
                data: {
                  plateNumber: vehicleData.id,
                  ...vehicleData.data(),
                },
                type: 'update',
                firstDocId,
                lastDocId,
              })
            );
          }
        }
      } else if (change.type === 'added' || change.type === 'removed') {
        const initialData = snapshot.docs.map((doc) => {
          if (!plateNumber || doc.id === plateNumber)
            return {
              plateNumber: doc.id,
              ...doc.data(),
            };
        });
        ws.send(
          JSON.stringify({
            type: 'add/remove',
            data: initialData,
            firstDocId,
            lastDocId,
          })
        );
      }
    });
  });
};

export {
  uploadPlatePicture,
  parkIn,
  parkOut,
  monitorQuery,
  updatePlate,
  monitorDefault,
};
