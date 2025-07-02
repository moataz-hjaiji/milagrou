import StoreRepo from '../../database/repository/StoreRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const store = await StoreRepo.remove(id);
  if (!store) throw new BadRequestError('Store not found');
};
