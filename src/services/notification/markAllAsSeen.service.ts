import NotificationRepo from '../../database/repository/NotificationRepo';

export const markAllAsSeen = async (userId: string) => {
  await NotificationRepo.updateMany({ userId }, { isSeen: true });
};
