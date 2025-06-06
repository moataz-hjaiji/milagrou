import PopupRepo from '../../database/repository/PopupRepo';
import { BadRequestError } from '../../core/ApiError';

export const remove = async (id: string) => {
  const popup = await PopupRepo.remove(id);
  if (!popup) throw new BadRequestError('Popup not found');
};
