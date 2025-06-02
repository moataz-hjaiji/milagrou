"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rating_1 = require("../../model/Rating");
const findByObj = (obj) => {
    return Rating_1.RatingModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map