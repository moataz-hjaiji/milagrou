"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Governorate_1 = require("../../model/Governorate");
const create = async (obj) => {
    return await Governorate_1.GovernorateModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map