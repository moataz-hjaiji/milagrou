import { ObjectId } from 'mongoose';
import IMenu, { MenuModel } from '../../model/Menu';

const update = async (
  id: string | ObjectId,
  obj: Partial<IMenu>
): Promise<IMenu | null> => {
  return await MenuModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
