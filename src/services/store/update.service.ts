import StoreRepo from '../../database/repository/StoreRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const store = await StoreRepo.update(id, body);
  if (!store) throw new BadRequestError('store not found');
  return store;
};
