import IStore, { StoreModel } from '../../model/Store';

const findByObj = (obj: object): Promise<IStore | null> => {
  return StoreModel.findOne(obj).exec();
};

export default findByObj;
