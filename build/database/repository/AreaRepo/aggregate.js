"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Area_1 = require("../../model/Area");
const aggregate = async (obj) => {
    return await Area_1.AreaModel.aggregate(obj);
};
exports.default = aggregate;
//# sourceMappingURL=aggregate.js.map