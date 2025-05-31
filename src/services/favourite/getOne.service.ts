import FavouriteRepo from '../../database/repository/FavouriteRepo';
import { BadRequestError } from '../../core/ApiError';
import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';

export const getOne = async (id: string, query: any) => {
  let favourite = await FavouriteRepo.findById(id, query);
  if (!favourite) throw new BadRequestError('Favourite not found');

  const favouriteObject = favourite.toObject();
  if (favouriteObject.product.productPrice) {
    const priceAfterDiscount = await getMaxDiscountedPrice(
      favouriteObject.product
    );
    favouriteObject.product.productPrice.priceAfterDiscount =
      priceAfterDiscount;
  }

  return favouriteObject;
};
