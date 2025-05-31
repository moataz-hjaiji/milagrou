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
      discount.target.menuId ??
      discount.target.categoryId ??
      discount.target.subCategoryId ??
      discount.target.productId ??
      null;

    const activeDiscountCheck = await DiscountRepo.findByObj({
      $and: [
        { isActive: true },
        {
          $or: [
            { 'target.menuId': targetId },
            { 'target.categoryId': targetId },
            { 'target.subCategoryId': targetId },
            { 'target.productId': targetId },
          ],
        },
      ],
    });

    if (activeDiscountCheck)
      throw new BadRequestError('this target already has an active discount');
  }
  const discount = await DiscountRepo.update(id, body);
  if (body.isActive === true) {
    let targetKey = '';
    const targetId =
      body.target.menuId !== undefined
        ? ((targetKey = 'menuId'), body.target.menuId)
        : body.target.categoryId !== undefined
          ? ((targetKey = 'categoryId'), body.target.categoryId)
          : body.target.subCategoryId !== undefined
            ? ((targetKey = 'subCategoryId'), body.target.subCategoryId)
            : body.target.productId !== undefined
              ? ((targetKey = 'productId'), body.target.productId)
              : null;

    const roleUser = await RoleRepo.findByCode('user');
    if (!roleUser) throw new NotFoundError('user role not found');

    const users = await UserRepo.findAllNotPaginated({
      roles: roleUser._id,
    });

    await Promise.all(
      users.map(async (user) => {
        await sendNotifUser(user._id.toString(), {
          data: {
            title: 'Nouvelle promotion',
            body: `Découvrez les nouveaux promotions dans l'application !`,
            [targetKey]: targetId,
          },
        });
      })
    );
  }
  return discount;
};
