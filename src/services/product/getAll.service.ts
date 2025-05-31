import ProductRepo from '../../database/repository/ProductRepo';
import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';
import { checkFavourite } from '../favourite/checkFavourite';

export const getAll = async (query: any) => {
  const { page, perPage, userId } = query;
  delete query.userId;

  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  let products = await ProductRepo.findAll(options, query);

  await Promise.all(
    products.docs.map(async (product: any) => {
      if (userId) {
        product.isFavourite = await checkFavourite(
          userId,
          product._id.toString()
        );
      }
      if (product.productPrice) {
        const priceAfterDiscount = await getMaxDiscountedPrice(product);
        product.productPrice.priceAfterDiscount = priceAfterDiscount;
      }
    })
  );

  const { docs, ...meta } = products;

  return {
    meta,
    docs,
  };
};
