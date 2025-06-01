import IArea, { AreaModel } from '../../model/Area';

const findByObj = (obj: object): Promise<IArea | null> => {
  return AreaModel.findOne(obj).exec();
};

export default findByObj;
