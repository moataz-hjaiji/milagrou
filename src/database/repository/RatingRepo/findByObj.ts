import IRating, { RatingModel } from '../../model/Rating';

const findByObj = (obj: object): Promise<IRating | null> => {
  return RatingModel.findOne(obj).exec();
};

export default findByObj;
