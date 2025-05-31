import NotificationRepo from '../../database/repository/NotificationRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
}

export const update = async ({ id, body }: updateParams) => {
  const notification = await NotificationRepo.update(id, body);
  if (!notification) throw new BadRequestError('notification not found');
  return notification;
};
