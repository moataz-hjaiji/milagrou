import IGovernorate, { GovernorateModel } from '../../model/Governorate';

const create = async (obj: Partial<IGovernorate>): Promise<IGovernorate> => {
  return await GovernorateModel.create(obj);
};

export default create;
