"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = require("../../model/Address");
const create = async (obj) => {
    return await Address_1.AddressModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map