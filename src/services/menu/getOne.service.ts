import MenuRepo from '../../database/repository/MenuRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const menu = await MenuRepo.findById(id, query);
  if (!menu) throw new BadRequestError('Menu not found');
  return menu;
};
