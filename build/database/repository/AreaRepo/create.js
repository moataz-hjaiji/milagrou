"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Area_1 = require("../../model/Area");
const create = async (obj) => {
    return await Area_1.AreaModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map