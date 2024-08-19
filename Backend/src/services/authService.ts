import bcrypt from 'bcryptjs';
import jwtUtils from '../utils/jwtUtils';
import { Admin } from '../model/adminInterface';
import { getAdminByUsername } from '../repositories/authRepository';

export const loginAdmin = async (
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
