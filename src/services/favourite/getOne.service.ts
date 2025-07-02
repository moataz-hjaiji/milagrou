import FavouriteRepo from '../../database/repository/FavouriteRepo';
import { BadRequestError } from '../../core/ApiError';
import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';

export const getOne = async (id: string, query: any) => {
  let favourite = await FavouriteRepo.findById(id, query);
  if (!favourite) throw new BadRequestError('Favourite not found');
  await favourite.populate([
    {
      path: 'product',
      populate: [
        {
          path: 'category',
          select: '-createdAt -updatedAt',
        },
        {
          path: 'supplements.supplement',
          select: '-createdAt -updatedAt',
        },
      ],
    },
  ]);
  const favouriteObject = favourite.toObject();
  const priceAfterDiscount = await getMaxDiscountedPrice(
    favouriteObject.product,
    false
  );
  favouriteObject.product.priceAfterDiscount = priceAfterDiscount;
  return favourite;
};
