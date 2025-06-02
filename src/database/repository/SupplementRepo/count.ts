import { SupplementModel } from '../../model/Supplement';

const countDocuments = async (obj: object) => {
  return await SupplementModel.countDocuments(obj);
};

export default countDocuments;
