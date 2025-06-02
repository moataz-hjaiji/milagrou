import { BadRequestError } from '../../core/ApiError';
import StoreRepo from '../../database/repository/StoreRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const store = await StoreRepo.create(body);
  if (!store) throw new BadRequestError('error creating store');
  return store;
};
