"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderPrices = void 0;
const getMaxDiscount_1 = require("../discount/getMaxDiscount");
async function calculateOrderPrices(items) {
    return await Promise.all(items.map(async (item) => {
        // Get base product price
        const priceAfterDiscount = await (0, getMaxDiscount_1.getMaxDiscountedPrice)(item.product);
        let supplementsTotal = 0;
        // Modify selected supplements to include prices
        if (item.selectedSupplements && item.selectedSupplements.length > 0) {
            item.selectedSupplements = item.selectedSupplements.map((selectedCat) => {
                const categoryInProduct = item.product.supplementArray.find((cat) => cat.supplementCategory._id.toString() ===
                    selectedCat.supplementCategory._id.toString());
                if (categoryInProduct) {
                    // Update supplements array with prices
                    const updatedSupplements = selectedCat.supplements.map((selected) => {
                        const supplementInProduct = categoryInProduct.supplements.find((sup) => sup.supplement._id.toString() ===
                            selected.supplement._id.toString());
                        if (supplementInProduct) {
                            supplementsTotal += supplementInProduct.price;
                            return {
                                ...selected,
                                price: supplementInProduct.price,
                            };
                        }
                        return selected;
                    });
                    return {
                        ...selectedCat,
                        supplements: updatedSupplements,
                    };
                }
                return selectedCat;
            });
        }
        const totalPrice = (priceAfterDiscount + supplementsTotal) * item.quantity;
        return {
            ...item,
            itemPrice: totalPrice,
        };
    }));
}
exports.calculateOrderPrices = calculateOrderPrices;
//# sourceMappingURL=calculateOrderPrices.js.map