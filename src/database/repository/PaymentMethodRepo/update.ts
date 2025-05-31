import { ObjectId } from 'mongoose';
import IPaymentMethod, { PaymentMethodModel } from '../../model/PaymentMethod';

const update = async (
  id: string | ObjectId,
  obj: Partial<IPaymentMethod>
): Promise<IPaymentMethod | null> => {
  return await PaymentMethodModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
