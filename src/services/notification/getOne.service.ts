import NotificationRepo from '../../database/repository/NotificationRepo';
import { BadRequestError } from '../../core/ApiError';

export const getOne = async (id: string, query: any) => {
  const notification = await NotificationRepo.findById(id, query);
  if (!notification) throw new BadRequestError('Notification not found');
  return notification;
};
