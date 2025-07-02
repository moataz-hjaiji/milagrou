import IProduct from '../../database/model/Product';
import ISupplement from '../../database/model/Supplement';
import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';

export async function calculateItemPrices(cartData: any) {
  return {
    ...cartData,
    items: await Promise.all(
      cartData.items.map(async (item: any) => {
        const product = item.product as IProduct;
        const basePrice = product?.price || 0;
        const priceAfterDiscount = await getMaxDiscountedPrice(product, false);

        const supplementsWithPrice =
          item.supplements?.map((supplement: any) => {
            const supplementPrice =
              product.supplements?.find(
                (sp) =>
                  (sp.supplement as ISupplement)._id.toString() ===
                  supplement._id.toString()
              )?.price || 0;

            return {
              ...supplement,
              price: supplementPrice,
            };
          }) || [];

        const supplementsPrice = supplementsWithPrice.reduce(
          (total: number, supplement: any) => {
            return total + supplement.price;
          },
          0
        );

        const totalPrice =
          (priceAfterDiscount + supplementsPrice) * item.quantity;

        return {
          ...item,
          supplements: supplementsWithPrice,
          itemPrice: {
            basePrice,
            priceAfterDiscount,
            supplementsPrice,
            totalPrice,
          },
        };
      })
    ),
  };
}
