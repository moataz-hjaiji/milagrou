"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keystore_1 = require("../../model/Keystore");
const remove = async (id) => {
    return Keystore_1.KeystoreModel.findByIdAndDelete(id).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map