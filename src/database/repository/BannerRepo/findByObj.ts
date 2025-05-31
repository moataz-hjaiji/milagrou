import IBanner, { BannerModel } from '../../model/Banner';

const findByObj = (obj: object): Promise<IBanner | null> => {
  return BannerModel.findOne(obj).exec();
};

export default findByObj;
