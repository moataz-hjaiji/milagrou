import { getMaxDiscountedPrice } from '../discount/getMaxDiscount';

export async function calculateOrderPrices(items: any) {
  return await Promise.all(
    items.map(async (item: any) => {
      // Get base product price
      const priceAfterDiscount = await getMaxDiscountedPrice(item.product);
      let supplementsTotal = 0;

      // Modify selected supplements to include prices
      if (item.selectedSupplements && item.selectedSupplements.length > 0) {
        item.selectedSupplements = item.selectedSupplements.map(
          (selectedCat: any) => {
            const categoryInProduct = item.product.supplementArray.find(
              (cat: any) =>
                cat.supplementCategory._id.toString() ===
                selectedCat.supplementCategory._id.toString()
            );

            if (categoryInProduct) {
              // Update supplements array with prices
              const updatedSupplements = selectedCat.supplements.map(
                (selected: any) => {
                  const supplementInProduct =
                    categoryInProduct.supplements.find(
                      (sup: any) =>
                        sup.supplement._id.toString() ===
                        selected.supplement._id.toString()
                    );

                  if (supplementInProduct) {
                    supplementsTotal += supplementInProduct.price;
                    return {
                      ...selected,
                      price: supplementInProduct.price,
                    };
                  }
                  return selected;
                }
              );

              return {
                ...selectedCat,
                supplements: updatedSupplements,
              };
            }
            return selectedCat;
          }
        );
      }

      const totalPrice =
        (priceAfterDiscount + supplementsTotal) * item.quantity;

      return {
        ...item,
        itemPrice: totalPrice,
      };
    })
  );
}
