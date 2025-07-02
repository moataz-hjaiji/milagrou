import FavouriteRepo from '../../database/repository/FavouriteRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const favourite = await FavouriteRepo.remove(id);
  if (!favourite) throw new BadRequestError('Favourite not found');
};
