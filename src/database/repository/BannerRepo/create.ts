import IBanner, { BannerModel } from '../../model/Banner';

const create = async (obj: Partial<IBanner>): Promise<IBanner> => {
  return await BannerModel.create(obj);
};

export default create;
