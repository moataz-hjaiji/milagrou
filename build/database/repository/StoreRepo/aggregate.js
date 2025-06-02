"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("../../model/Store");
const aggregate = async (obj) => {
    return await Store_1.StoreModel.aggregate(obj);
};
exports.default = aggregate;
//# sourceMappingURL=aggregate.js.map