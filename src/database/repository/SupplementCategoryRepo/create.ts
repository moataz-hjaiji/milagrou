import ISupplementCategory, {
  SupplementCategoryModel,
} from '../../model/SupplementCategory';

const create = async (
  obj: Partial<ISupplementCategory>
): Promise<ISupplementCategory> => {
  return await SupplementCategoryModel.create(obj);
};

export default create;
