import IArea, { AreaModel } from '../../model/Area';

const create = async (obj: Partial<IArea>): Promise<IArea> => {
  return await AreaModel.create(obj);
};

export default create;
