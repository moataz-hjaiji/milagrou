import OrderRepo from '../../database/repository/OrderRepo';
import UserRepo from '../../database/repository/UserRepo';

export const getAll = async (query: any) => {
  const { page, perPage } = query;
  const options = {
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(perPage as string, 10) || 10,
  };

  const users = await UserRepo.findAll(options, query);
  await Promise.all(
    users.docs.map(async (user: any) => {
      const orderCount = await OrderRepo.count({ userId: user._id.toString() });
      user.orderCount = orderCount;
    })
  );
  const { docs, ...meta } = users;

  return {
    meta,
    docs,
  };
};
