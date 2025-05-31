import BannerRepo from '../../database/repository/BannerRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const banner = await BannerRepo.findById(id, query);
  if (!banner) throw new BadRequestError('Banner not found');
  return banner;
};
