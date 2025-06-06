import PopupRepo from '../../database/repository/PopupRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const popup = await PopupRepo.findById(id, query);
  if (!popup) throw new BadRequestError('Popup not found');
  return popup;
};
