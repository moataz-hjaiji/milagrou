import BannerRepo from '../../database/repository/BannerRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const banner = await BannerRepo.remove(id);
  if (!banner) throw new BadRequestError('Banner not found');
};
