"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Supplement_1 = require("../../model/Supplement");
const create = async (obj) => {
    return await Supplement_1.SupplementModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map