import { ObjectId } from 'mongoose';
import IBanner, { BannerModel } from '../../model/Banner';

const remove = async (id: string | ObjectId): Promise<IBanner | null> => {
  return await BannerModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
