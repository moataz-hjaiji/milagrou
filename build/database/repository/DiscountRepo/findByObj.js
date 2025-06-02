"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discount_1 = require("../../model/Discount");
const findByObj = (obj) => {
    return Discount_1.DiscountModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map