import ISupplementCategory, {
  SupplementCategoryModel,
} from '../../model/SupplementCategory';

const findByObj = (obj: object): Promise<ISupplementCategory | null> => {
  return SupplementCategoryModel.findOne(obj).exec();
};

export default findByObj;
