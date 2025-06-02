"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = require("../../model/Address");
const remove = async (id) => {
    return await Address_1.AddressModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map