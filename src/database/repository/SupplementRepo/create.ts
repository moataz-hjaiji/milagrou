import ISupplement, { SupplementModel } from '../../model/Supplement';

const create = async (obj: Partial<ISupplement>): Promise<ISupplement> => {
  return await SupplementModel.create(obj);
};

export default create;
