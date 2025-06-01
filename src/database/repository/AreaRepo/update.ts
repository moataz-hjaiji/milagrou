import { ObjectId } from 'mongoose';
import IArea, { AreaModel } from '../../model/Area';

const update = async (
  id: string | ObjectId,
  obj: Partial<IArea>
): Promise<IArea | null> => {
  return await AreaModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
