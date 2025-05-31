import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';

export async function calculateItemPrices(cartData: any) {
  return {
    ...cartData,
    items: await Promise.all(
      cartData.items.map(async (item: any) => {
        // Get base product price
        const basePrice = item.product?.productPrice?.price;
        const priceAfterDiscount = await getMaxDiscountedPrice(item.product);

        // Add prices to each selected supplement and calculate total supplements price
        const supplementsPrice = item.selectedSupplements.reduce(
          (total: any, selectedSupCat: any) => {
            // Find matching supplement category in product's supplementArray
            const matchingCategory = item.product?.supplementArray.find(
              (sa: any) =>
                sa.supplementCategory?._id.toString() ===
                selectedSupCat.supplementCategory?._id.toString()
            );

            if (!matchingCategory) return total;

            // Add price to each selected supplement and calculate category total
            const categoryTotal = selectedSupCat.supplements.reduce(
              (supTotal: any, selectedSup: any) => {
                const matchingSupplement = matchingCategory.supplements.find(
                  (s: any) =>
                    s.supplement?._id.toString() ===
                    selectedSup.supplement?._id.toString()
                );

                // Add the price to the selected supplement
                selectedSup.supplement.price = matchingSupplement?.price || 0;

                return supTotal + (matchingSupplement?.price || 0);
              },
              0
            );

            return total + categoryTotal;
          },
          0
        );

        // Calculate total price for this item
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
