"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = require("../../model/Address");
const update = async (id, obj) => {
    return await Address_1.AddressModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map