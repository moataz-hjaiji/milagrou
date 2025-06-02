import FavouriteRepo from '../../database/repository/FavouriteRepo';
import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
    populate: 'product.category',
  };

  const favourites = await FavouriteRepo.findAll(options, query);
  await Promise.all(
    favourites.docs.map(async (favourite: any) => {
      const priceAfterDiscount = await getMaxDiscountedPrice(favourite.product);
      favourite.product.priceAfterDiscount = priceAfterDiscount;
    })
  );
  const { docs, ...meta } = favourites;

  return {
    meta,
    docs,
  };
};
