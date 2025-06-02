"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Governorate_1 = require("../../model/Governorate");
const aggregate = async (obj) => {
    return await Governorate_1.GovernorateModel.aggregate(obj);
};
exports.default = aggregate;
//# sourceMappingURL=aggregate.js.map