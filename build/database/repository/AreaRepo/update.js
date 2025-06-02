"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Area_1 = require("../../model/Area");
const update = async (id, obj) => {
    return await Area_1.AreaModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map