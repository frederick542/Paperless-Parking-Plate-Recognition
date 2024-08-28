import bcrypt from 'bcryptjs';
import { Admin } from '../model/adminInterface';
import { db } from '../config/firebaseConfig';
import { User } from '../model/userInterface';

const USER_COLLECTION = 'user';
const ADMIN_COLLECTION = 'admin';
const SALT = process.env.SALT || '10';

const getAdminByUsername = async (username: string) => {
  try {
    const doc = await db.collection(ADMIN_COLLECTION).doc(username).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Admin) };
  } catch (error) {
    return null;
  }
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const querySnapshot = await db
      .collection(USER_COLLECTION)
      .where('email', '==', email)
      .get();
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    const data = doc.data() as User;
    return {
      plate: doc.id,
      name: data.name,
      email: data.email,
      password: data.password,
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
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

const checkUserAvailability = async (
  license_plate: string,
  registered_email: string
) => {
  try {
    const docRef = db.collection('user').doc(license_plate);
    const emailCheck = await db
      .collection('user')
      .where('email', '==', registered_email)
      .get();
    const doc = await docRef.get();
    if (!emailCheck.empty) {
      return {
        status: 'unaccepted',
        message: 'Email already registered',
      };
    }
    if (doc.exists) {
      return {
        status: 'unaccepted',
        message: 'Vehicle already registered',
      };
    }

    const data = doc.data();
    return {
      status: 'accepted',
      message: 'Valid email and license plate',
    };
  } catch (error) {
    throw error;
  }
};

const registerUser = async (
  username: string,
  password: string,
  license_plate: string,
  email: string
) => {
  const DocRef = db.collection('user').doc(license_plate);
  await DocRef.set({
    name: username,
    email: email,
    password: await bcrypt.hash(password, parseInt(SALT)),
    paidStatus: false,
  });
};

export {
  checkVehicleRegistered,
  checkVehicleIn,
  getAdminByUsername,
  checkUserAvailability,
  registerUser,
  getUserByEmail,
};
