import DiscountRepo from '../../database/repository/DiscountRepo';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import RoleRepo from '../../database/repository/RoleRepo';
import UserRepo from '../../database/repository/UserRepo';
import { sendNotifUser } from '../../helpers/notif';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  if (body.isActive === true) {
    const discount = await DiscountRepo.findById(id);
    if (!discount) throw new BadRequestError('discount not found');

    const targetId =
      discount.target.categoryId ?? discount.target.productId ?? null;

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
  const discount = await DiscountRepo.update(id, body);
  return discount;
};
