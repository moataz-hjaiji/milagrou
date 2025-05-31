import { ObjectId } from 'mongoose';
import IPaymentMethod, { PaymentMethodModel } from '../../model/PaymentMethod';

const remove = async (
  id: string | ObjectId
): Promise<IPaymentMethod | null> => {
  return await PaymentMethodModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
