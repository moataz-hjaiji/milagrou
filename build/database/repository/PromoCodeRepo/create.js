"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PromoCode_1 = require("../../model/PromoCode");
const create = async (obj) => {
    return await PromoCode_1.PromoCodeModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map