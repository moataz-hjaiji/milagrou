import IGovernorate, { GovernorateModel } from '../../model/Governorate';

const findByObj = (obj: object): Promise<IGovernorate | null> => {
  return GovernorateModel.findOne(obj).exec();
};

export default findByObj;
