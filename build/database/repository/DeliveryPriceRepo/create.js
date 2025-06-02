"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeliveryPrice_1 = require("../../model/DeliveryPrice");
const create = async (obj) => {
    return await DeliveryPrice_1.DeliveryPriceModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map