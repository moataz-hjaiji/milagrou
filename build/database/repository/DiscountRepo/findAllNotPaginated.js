"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discount_1 = require("../../model/Discount");
const findAll = (obj) => {
    return Discount_1.DiscountModel.find(obj).exec();
};
exports.default = findAll;
//# sourceMappingURL=findAllNotPaginated.js.map