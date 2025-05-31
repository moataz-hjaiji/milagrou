import { BadRequestError } from '../../core/ApiError';
import AddressRepo from '../../database/repository/AddressRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  const address = await AddressRepo.create(body);
  if (!address) throw new BadRequestError('error creating address');
  return address;
};
