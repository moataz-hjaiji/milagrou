import { DiscountType } from '../../database/model/Discount';
import IProduct from '../../database/model/Product';
import IProductPrice from '../../database/model/ProductPrice';
import DiscountRepo from '../../database/repository/DiscountRepo';

const extractTargetIds = (product: any): string[] => {
  const targetIds = new Set<string>();

  // Add product ID
  if (product?._id) {
    targetIds.add(product?._id);
  }

  // From direct category path
  if (product?.category) {
    targetIds.add(product?.category?._id);
    if (product?.category?.menu?._id) {
      targetIds.add(product?.category?.menu?._id);
    }
  }

  // From subcategory path
  if (product?.subCategory) {
    targetIds.add(product?.subCategory?._id);
    if (product?.subCategory?.category) {
      targetIds.add(product?.subCategory?.category?._id);
      if (product?.subCategory?.category?.menu?._id) {
        targetIds.add(product?.subCategory?.category?.menu?._id);
      }
    }
  }

  return Array.from(targetIds);
};

const calculateMaxDiscount = (product: any, discounts: any) => {
  if (!discounts.length) {
    return product?.productPrice?.price;
  }

  const originalPrice = product?.productPrice?.price;
  let maxDiscount = 0;
  let finalPrice = originalPrice;

  discounts.forEach((discount: any) => {
    let discountedPrice = originalPrice;

    if (discount.type === DiscountType.PERCENTAGE) {
      const discountAmount = originalPrice * (discount.amount / 100);
      discountedPrice = originalPrice - discountAmount;
    } else if (discount.type === DiscountType.AMOUNT) {
      discountedPrice = originalPrice - discount.amount;
    }

    // Ensure price doesn't go below 0
    discountedPrice = Math.max(0, discountedPrice);

    // If this discount results in a lower price (bigger discount), update our tracking variables
    if (originalPrice - discountedPrice > maxDiscount) {
      maxDiscount = originalPrice - discountedPrice;
      finalPrice = discountedPrice;
    }
  });

  return Number(finalPrice.toFixed(2));
};

export async function getMaxDiscountedPrice(product: IProduct) {
  const targetIds = extractTargetIds(product);
  if (targetIds.length > 0) {
    const currentDate = new Date();
    const discounts = await DiscountRepo.findAllNotPaginated({
      $and: [
        { isActive: true },
        { startDate: { $lte: currentDate } },
        { endDate: { $gte: currentDate } },
        {
          $or: [
            { 'target.menuId': { $in: targetIds } },
            { 'target.categoryId': { $in: targetIds } },
            { 'target.subCategoryId': { $in: targetIds } },
            { 'target.productId': { $in: targetIds } },
          ],
        },
      ],
    });
    if (discounts.length > 0)
      return calculateMaxDiscount(product, discounts) as number;
    return (product?.productPrice as IProductPrice)?.price;
  }
  return (product?.productPrice as IProductPrice)?.price;
}
