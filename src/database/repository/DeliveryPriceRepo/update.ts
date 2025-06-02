import { ObjectId } from 'mongoose';
import IDeliveryPrice, { DeliveryPriceModel } from '../../model/DeliveryPrice';

const update = async (
  id: string | ObjectId,
  obj: Partial<IDeliveryPrice>
): Promise<IDeliveryPrice | null> => {
  return await DeliveryPriceModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
