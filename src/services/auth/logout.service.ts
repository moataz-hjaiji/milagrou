import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { Types } from 'mongoose';

export const logout = async (keystoreId: Types.ObjectId) => {
  await KeystoreRepo.remove(keystoreId);
};
