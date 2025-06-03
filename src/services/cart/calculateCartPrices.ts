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
        const priceAfterDiscount = await getMaxDiscountedPrice(product);

        // Calculate supplements price from product's supplements array
        const supplementsPrice =
          item.supplements?.reduce((total: any, supplementId: any) => {
            const supplementPrice =
              product.supplements?.find(
                (sp) =>
                  (sp.supplement as ISupplement)._id.toString() ===
                  supplementId.toString()
              )?.price || 0;
            return total + supplementPrice;
          }, 0) || 0;

        const totalPrice =
          (priceAfterDiscount + supplementsPrice) * item.quantity;

        return {
          ...item,
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
