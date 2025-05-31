import { BadRequestError, NotFoundError } from '../../core/ApiError';
import BannerRepo from '../../database/repository/BannerRepo';
import RoleRepo from '../../database/repository/RoleRepo';
import UserRepo from '../../database/repository/UserRepo';
import { sendNotifUser } from '../../helpers/notif';

interface createParams {
  body: any;
  file?: Express.Request['file'];
}

export const create = async ({ body, file }: createParams) => {
  if (file) body.picture = file.path;
  const banner = await BannerRepo.create(body);
  if (!banner) throw new BadRequestError('error creating banner');

  if (body.isPublished) {
    const roleUser = await RoleRepo.findByCode('user');
    if (!roleUser) throw new NotFoundError('admin role not found');
    const users = await UserRepo.findAllNotPaginated({
      roles: roleUser._id,
    });
    await Promise.all(
      users.map(async (user) => {
        await sendNotifUser(user._id.toString(), {
          data: {
            title: 'Nouvelle banner',
            body: `${body.titleFr}`,
          },
        });
      })
    );
  }

  return banner;
};
