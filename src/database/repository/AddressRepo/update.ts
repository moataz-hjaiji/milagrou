import { ObjectId } from 'mongoose';
import IAddress, { AddressModel } from '../../model/Address';

const update = async (
  id: string | ObjectId,
  obj: Partial<IAddress>
): Promise<IAddress | null> => {
  return await AddressModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
