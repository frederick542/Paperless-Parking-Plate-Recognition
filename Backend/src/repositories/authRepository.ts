import { Admin } from '../model/adminInterface';
import { db } from '../config/firebaseConfig';

const ADMIN_COLLECTION = 'admin';

const getAdminByUsername = async (username: string) => {
  const doc = await db.collection(ADMIN_COLLECTION).doc(username).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Admin) };
};

const checkVehicleRegistered = async (license_plate: string) => {
  const docRef = db.collection('user').doc(license_plate);
  const doc = await docRef.get();
  return doc.exists;
};

const checkVehicleIn = async (LOCATION: string, license_plate: string) => {
  const locationDocRef = db
    .collection('location')
    .doc(LOCATION)
    .collection('in')
    .doc(license_plate);
  const doc = await locationDocRef.get();

  return doc.exists;
};

export { checkVehicleRegistered, checkVehicleIn, getAdminByUsername };
