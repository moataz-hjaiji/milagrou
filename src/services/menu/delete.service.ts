import MenuRepo from '../../database/repository/MenuRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const menu = await MenuRepo.remove(id);
  if (!menu) throw new BadRequestError('Menu not found');
};
