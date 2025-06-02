"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discount_1 = require("../../model/Discount");
const create = async (obj) => {
    return await Discount_1.DiscountModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map