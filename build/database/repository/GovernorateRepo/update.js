"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Governorate_1 = require("../../model/Governorate");
const update = async (id, obj) => {
    return await Governorate_1.GovernorateModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map