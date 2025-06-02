"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateItemPrices = void 0;
const getMaxDiscount_1 = require("../discount/getMaxDiscount");
async function calculateItemPrices(cartData) {
    return {
        ...cartData,
        items: await Promise.all(cartData.items.map(async (item) => {
            var _a, _b;
            // Get base product price
            const basePrice = (_b = (_a = item.product) === null || _a === void 0 ? void 0 : _a.productPrice) === null || _b === void 0 ? void 0 : _b.price;
            const priceAfterDiscount = await (0, getMaxDiscount_1.getMaxDiscountedPrice)(item.product);
            // Add prices to each selected supplement and calculate total supplements price
            const supplementsPrice = item.selectedSupplements.reduce((total, selectedSupCat) => {
                var _a;
                // Find matching supplement category in product's supplementArray
                const matchingCategory = (_a = item.product) === null || _a === void 0 ? void 0 : _a.supplementArray.find((sa) => {
                    var _a, _b;
                    return ((_a = sa.supplementCategory) === null || _a === void 0 ? void 0 : _a._id.toString()) ===
                        ((_b = selectedSupCat.supplementCategory) === null || _b === void 0 ? void 0 : _b._id.toString());
                });
                if (!matchingCategory)
                    return total;
                // Add price to each selected supplement and calculate category total
                const categoryTotal = selectedSupCat.supplements.reduce((supTotal, selectedSup) => {
                    const matchingSupplement = matchingCategory.supplements.find((s) => {
                        var _a, _b;
                        return ((_a = s.supplement) === null || _a === void 0 ? void 0 : _a._id.toString()) ===
                            ((_b = selectedSup.supplement) === null || _b === void 0 ? void 0 : _b._id.toString());
                    });
                    // Add the price to the selected supplement
                    selectedSup.supplement.price = (matchingSupplement === null || matchingSupplement === void 0 ? void 0 : matchingSupplement.price) || 0;
                    return supTotal + ((matchingSupplement === null || matchingSupplement === void 0 ? void 0 : matchingSupplement.price) || 0);
                }, 0);
                return total + categoryTotal;
            }, 0);
            // Calculate total price for this item
            const totalPrice = (priceAfterDiscount + supplementsPrice) * item.quantity;
            return {
                ...item,
                itemPrice: {
                    basePrice,
                    priceAfterDiscount,
                    supplementsPrice,
                    totalPrice,
                },
            };
        })),
    };
}
exports.calculateItemPrices = calculateItemPrices;
//# sourceMappingURL=calculateCartPrices.js.map