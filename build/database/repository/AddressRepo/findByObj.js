"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = require("../../model/Address");
const findByObj = (obj) => {
    return Address_1.AddressModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map