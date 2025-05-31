import { ObjectId } from 'mongoose';
import IAddress, { AddressModel } from '../../model/Address';

const remove = async (id: string | ObjectId): Promise<IAddress | null> => {
  return await AddressModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
