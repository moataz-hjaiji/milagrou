"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Area_1 = require("../../model/Area");
const findByObj = (obj) => {
    return Area_1.AreaModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map