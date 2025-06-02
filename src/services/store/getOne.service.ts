import StoreRepo from '../../database/repository/StoreRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const store = await StoreRepo.findById(id, query);
  if (!store) throw new BadRequestError('Store not found');
  return store;
};
