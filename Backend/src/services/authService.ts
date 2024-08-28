import bcrypt from 'bcryptjs';
import jwtUtils from '../utils/jwtUtils';
import { Admin } from '../model/adminInterface';
import {
  checkUserAvailability,
  getAdminByUsername,
  getUserByEmail,
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
    tokenVal: token,
    location: admin.location,
  };
};

const handleUserLogin = async (
  email: string,
  password: string
): Promise<object> => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  const userPayload = {
    plate: user.plate,
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
  plate: string,
  email: string
) => {
  const result = await checkUserAvailability(plate, email);
  if (result.status === 'unaccepted') {
    return result;
  }

  registerUser(username, password, plate, email);
  return result;
};

export { handleAdminLogin, handleUserLogin, handleUserRegister };
