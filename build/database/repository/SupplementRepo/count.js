"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Supplement_1 = require("../../model/Supplement");
const countDocuments = async (obj) => {
    return await Supplement_1.SupplementModel.countDocuments(obj);
};
exports.default = countDocuments;
//# sourceMappingURL=count.js.map