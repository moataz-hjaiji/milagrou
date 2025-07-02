import FavouriteRepo from '../../database/repository/FavouriteRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const favourite = await FavouriteRepo.update(id, body);
  if (!favourite) throw new BadRequestError('favourite not found');
  return favourite;
};
