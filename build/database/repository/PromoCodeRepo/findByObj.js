"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PromoCode_1 = require("../../model/PromoCode");
const findByObj = (obj) => {
    return PromoCode_1.PromoCodeModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map