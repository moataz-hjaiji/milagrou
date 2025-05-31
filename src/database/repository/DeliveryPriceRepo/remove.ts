import { ObjectId } from 'mongoose';
import IDeliveryPrice, { DeliveryPriceModel } from '../../model/DeliveryPrice';

const remove = async (
  id: string | ObjectId
): Promise<IDeliveryPrice | null> => {
  return await DeliveryPriceModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
