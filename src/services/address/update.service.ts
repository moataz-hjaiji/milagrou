import AddressRepo from '../../database/repository/AddressRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const address = await AddressRepo.update(id, body);
  if (!address) throw new BadRequestError('address not found');
  return address;
};
