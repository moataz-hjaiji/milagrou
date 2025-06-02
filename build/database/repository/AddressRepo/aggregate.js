"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = require("../../model/Address");
const aggregate = async (obj) => {
    return await Address_1.AddressModel.aggregate(obj);
};
exports.default = aggregate;
//# sourceMappingURL=aggregate.js.map