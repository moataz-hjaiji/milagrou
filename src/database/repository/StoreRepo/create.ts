import IStore, { StoreModel } from '../../model/Store';

const create = async (obj: Partial<IStore>): Promise<IStore> => {
  return await StoreModel.create(obj);
};

export default create;
