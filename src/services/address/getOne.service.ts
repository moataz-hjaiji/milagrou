import AddressRepo from '../../database/repository/AddressRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const address = await AddressRepo.findById(id, query);
  if (!address) throw new BadRequestError('Address not found');
  return address;
};
