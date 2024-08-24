import bcrypt from 'bcryptjs';
import { Admin } from '../model/adminInterface';
import { db } from '../config/firebaseConfig';
import { User } from '../model/userInterface';

const USER_COLLECTION = 'user';
const ADMIN_COLLECTION = 'admin';

const getAdminByUsername = async (username: string) => {
  try {
    const doc = await db.collection(ADMIN_COLLECTION).doc(username).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Admin) };
  } catch (error) {
    return null;
  }
};

const getUserByPlate = async (plate: string) => {
  try {
    const doc = await db.collection(USER_COLLECTION).doc(plate).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as User) };
  } catch (error) {
    return null;
  }
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

const checkUserAvailability = async (license_plate: string) => {
  const DocRef = db.collection('user').doc(license_plate);
  const doc = await DocRef.get();
  return doc.exists;
};

const registerUser = async (
  username: string,
  password: string,
  license_plate: string
) => {
  const DocRef = db.collection('user').doc(license_plate);
  await DocRef.set({
    name: username,
    password: await bcrypt.hash(password, 10),
    paidStatus: false,
  });
};

export {
  checkVehicleRegistered,
  checkVehicleIn,
  getAdminByUsername,
  checkUserAvailability,
  registerUser,
  getUserByPlate,
};
