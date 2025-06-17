import PopupRepo from '../../database/repository/PopupRepo';
import { BadRequestError } from '../../core/ApiError';
import { ObjectId } from 'mongoose';

export const markAsSeen = async (
  id: string,
  userId: ObjectId,
  browserId: string
) => {
  let popup = await PopupRepo.findById(id);
  if (!popup) throw new BadRequestError('Popup not found');

  if (userId) popup.users.push(userId);
  if (browserId) popup.browserIds.push(browserId);

  await popup.save();
  return popup;
};
