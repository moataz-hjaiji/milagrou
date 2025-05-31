import AddressRepo from '../../database/repository/AddressRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const address = await AddressRepo.remove(id);
  if (!address) throw new BadRequestError('Address not found');
};
