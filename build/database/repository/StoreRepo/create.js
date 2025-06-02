"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("../../model/Store");
const create = async (obj) => {
    return await Store_1.StoreModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map