import IRating, { RatingModel } from '../../model/Rating';

const create = async (obj: Partial<IRating>): Promise<IRating> => {
  return await RatingModel.create(obj);
};

export default create;
