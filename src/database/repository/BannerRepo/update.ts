import { ObjectId } from 'mongoose';
import IBanner, { BannerModel } from '../../model/Banner';

const update = async (
  id: string | ObjectId,
  obj: Partial<IBanner>
): Promise<IBanner | null> => {
  return await BannerModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
