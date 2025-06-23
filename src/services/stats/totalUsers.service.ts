import UserRepo from '../../database/repository/UserRepo';

export const totalUsers = async () => {
  let aggregationOptions: any = [
    {
      $match: {
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'Roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roleDetails',
      },
    },
    {
      $match: {
        'roleDetails.name': 'user',
      },
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalVerifiedUsers: {
          $sum: {
            $cond: [{ $eq: ['$verified', true] }, 1, 0],
          },
        },
      },
    },
  ];

  const result = await UserRepo.aggregate(aggregationOptions);

  if (result.length === 0) {
    return {
      totalUsers: 0,
      totalVerifiedUsers: 0,
    };
  }

  return {
    totalUsers: result[0].totalUsers,
    totalVerifiedUsers: result[0].totalVerifiedUsers,
  };
};
