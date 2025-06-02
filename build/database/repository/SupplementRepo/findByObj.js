"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Supplement_1 = require("../../model/Supplement");
const findByObj = (obj) => {
    return Supplement_1.SupplementModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map