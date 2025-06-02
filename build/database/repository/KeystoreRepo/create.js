"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keystore_1 = require("../../model/Keystore");
const create = async (client, primaryKey, secondaryKey) => {
    const now = new Date();
    const keystore = await Keystore_1.KeystoreModel.create({
        client: client,
        primaryKey: primaryKey,
        secondaryKey: secondaryKey,
    });
    return keystore.toObject();
};
exports.default = create;
//# sourceMappingURL=create.js.map