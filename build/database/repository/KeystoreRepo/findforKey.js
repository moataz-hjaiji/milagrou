"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keystore_1 = require("../../model/Keystore");
const findforKey = (client, key) => {
    return Keystore_1.KeystoreModel.findOne({ client: client, primaryKey: key }).exec();
};
exports.default = findforKey;
//# sourceMappingURL=findforKey.js.map