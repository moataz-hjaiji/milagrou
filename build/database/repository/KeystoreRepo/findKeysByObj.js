"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keystore_1 = require("../../model/Keystore");
const findKeysByObj = (obj) => {
    return Keystore_1.KeystoreModel.find(obj)
        .select('+client +primaryKey +secondaryKey')
        .sort({ createdAt: -1 })
        .exec();
};
exports.default = findKeysByObj;
//# sourceMappingURL=findKeysByObj.js.map