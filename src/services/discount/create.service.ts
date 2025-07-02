import { BadRequestError } from '../../core/ApiError';
import DiscountRepo from '../../database/repository/DiscountRepo';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  if (body.isActive === true) {
    const targetId = body.target.categoryId ?? body.target.productId ?? null;
    const activeDiscountCheck = await DiscountRepo.findByObj({
      $and: [
        { isActive: true },
        {
          $or: [
            { 'target.categoryId': targetId },
            { 'target.productId': targetId },
          ],
        },
      ],
    });
    if (activeDiscountCheck)
      throw new BadRequestError('this target already has an active discount');
  }

  const discount = await DiscountRepo.create(body);
  if (!discount) throw new BadRequestError('error creating discount');
  return discount;
};
