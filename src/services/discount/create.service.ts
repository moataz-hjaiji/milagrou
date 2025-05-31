import { BadRequestError, NotFoundError } from '../../core/ApiError';
import DiscountRepo from '../../database/repository/DiscountRepo';
import RoleRepo from '../../database/repository/RoleRepo';
import UserRepo from '../../database/repository/UserRepo';
import { sendNotifUser } from '../../helpers/notif';

interface createParams {
  body: any;
}

export const create = async ({ body }: createParams) => {
  if (body.isActive === true) {
    const targetId =
      body.target.menuId ??
      body.target.categoryId ??
      body.target.subCategoryId ??
      body.target.productId ??
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
  const discount = await DiscountRepo.create(body);
  if (!discount) throw new BadRequestError('error creating discount');

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
    if (!roleUser) throw new NotFoundError('admin role not found');

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
