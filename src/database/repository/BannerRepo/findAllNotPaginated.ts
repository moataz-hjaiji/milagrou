import IBanner, { BannerModel } from '../../model/Banner';

const findAll = (obj: object): Promise<IBanner[]> => {
  return BannerModel.find(obj).exec();
};

export default findAll;
