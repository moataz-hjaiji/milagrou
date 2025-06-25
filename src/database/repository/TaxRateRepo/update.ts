import { ObjectId } from 'mongoose';
import ITaxRate, { TaxRateModel } from '../../model/TaxRate';

const update = async (
  id: string | ObjectId,
  obj: Partial<ITaxRate>
): Promise<ITaxRate | null> => {
  return await TaxRateModel.findByIdAndUpdate(
    id,
    { $set: { ...obj } },
    { new: true, runValidators: true, context: 'query' }
  ).exec();
};

export default update;
