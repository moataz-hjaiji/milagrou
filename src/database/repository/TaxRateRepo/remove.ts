import { ObjectId } from 'mongoose';
import ITaxRate, { TaxRateModel } from '../../model/TaxRate';

const remove = async (id: string | ObjectId): Promise<ITaxRate | null> => {
  return await TaxRateModel.findByIdAndUpdate(
    id,
    { $set: { deletedAt: Date.now() } },
    { new: true }
  ).exec();
};

export default remove;
