import ISupplement, { SupplementModel } from '../../model/Supplement';

const findByObj = (obj: object): Promise<ISupplement | null> => {
  return SupplementModel.findOne(obj).exec();
};

export default findByObj;
