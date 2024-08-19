import bcrypt from 'bcryptjs';
import jwtUtils from '../utils/jwtUtils';
import { Admin } from '../model/adminInterface';
import {
  checkUserAvailability,
  getAdminByUsername,
  getUserByPlate,
  registerUser,
} from '../repositories/authRepository';
import { error } from 'console';

const handleAdminLogin = async (
  username: string,
  password: string
): Promise<object> => {
  const admin = await getAdminByUsername(username);
  if (!admin) {
    throw new Error('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  const adminPayload: Omit<Admin, 'password'> = {
    username: admin.username,
    location: admin.location,
  };

  const token = jwtUtils.generateToken(adminPayload);
  return {
    token: token,
    location: admin.location,
  };
};

const handleUserLogin = async (
  plate: string,
  password: string
): Promise<object> => {
  const user = await getUserByPlate(plate);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  const userPayload = {
    plate: user.id,
    username: user.name,
  };
  
  const token = jwtUtils.generateToken(userPayload);
  return {
    token: token,
    username: user.name
  };
};

const handleUserRegister = async (
  username: string,
  password: string,
  plate: string
) => {
  if (await checkUserAvailability(plate)) {
    throw error;
  }

  registerUser(username, password, plate);
};

export { handleAdminLogin, handleUserLogin, handleUserRegister };
