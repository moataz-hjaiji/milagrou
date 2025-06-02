"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keystore_1 = require("../../model/Keystore");
const find = async (client, primaryKey, secondaryKey) => {
    return Keystore_1.KeystoreModel.findOne({
        client: client,
        primaryKey: primaryKey,
        secondaryKey: secondaryKey,
    }).exec();
};
exports.default = find;
//# sourceMappingURL=find.js.map