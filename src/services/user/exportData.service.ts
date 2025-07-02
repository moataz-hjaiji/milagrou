import UserRepo from '../../database/repository/UserRepo';
import { Parser } from 'json2csv';

export const exportData = async (ids: string[]) => {
  const users = await UserRepo.findAllNotPaginated({
    _id: {
      $in: ids,
    },
  });

  const userData = users.map((user) => user.toObject());
  // const fields = ['_id', 'firstName', 'lastName', 'email', 'phoneNumber']; // specify fields to include
  const parser = new Parser();
  // { fields }
  const csv = parser.parse(userData);

  return {
    csv,
  };
};
