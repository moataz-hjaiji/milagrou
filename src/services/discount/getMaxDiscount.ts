import { DiscountType } from '../../database/model/Discount';
import IProduct from '../../database/model/Product';
import DiscountRepo from '../../database/repository/DiscountRepo';

const extractTargetIds = (product: any): string[] => {
  const targetIds = new Set<string>();

  if (product?._id) {
    targetIds.add(product._id);
  }

  if (product?.category?._id) {
    targetIds.add(product.category._id);
  }

  return Array.from(targetIds);
};

const calculateMaxDiscount = (product: any, discounts: any) => {
  if (!discounts.length) {
    return product?.price;
  }

  const originalPrice = product?.price;
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
            { 'target.categoryId': { $in: targetIds } },
            { 'target.productId': { $in: targetIds } },
          ],
        },
      ],
    });
    if (discounts.length > 0)
      return calculateMaxDiscount(product, discounts) as number;
    return product.price;
  }
  return product.price;
}
