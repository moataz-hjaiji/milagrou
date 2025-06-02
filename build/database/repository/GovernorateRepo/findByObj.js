"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Governorate_1 = require("../../model/Governorate");
const findByObj = (obj) => {
    return Governorate_1.GovernorateModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map