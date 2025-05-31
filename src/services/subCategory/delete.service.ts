import SubCategoryRepo from '../../database/repository/SubCategoryRepo';
import { BadRequestError } from '../../core/ApiError';
import CategoryRepo from '../../database/repository/CategoryRepo';

export const remove = async (id: string) => {
  const subCategory = await SubCategoryRepo.remove(id);
  if (!subCategory) throw new BadRequestError('SubCategory not found');

  const subCategoryCheck = await SubCategoryRepo.findById(id);

  if (subCategoryCheck!.category) {
    const check = await SubCategoryRepo.count({
      category: subCategoryCheck!.category,
    });
    if (check === 0) {
      await CategoryRepo.update(subCategoryCheck!.category.toString(), {
        hasNoSubCategory: true,
      });
    }
  }
};
