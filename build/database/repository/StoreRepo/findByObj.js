"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("../../model/Store");
const findByObj = (obj) => {
    return Store_1.StoreModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map