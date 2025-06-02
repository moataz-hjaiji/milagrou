"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../model/Product");
const bulkWrite = async (updates) => {
    const bulkOps = updates.map((update) => ({
        updateOne: {
            filter: { _id: update.id },
            update: { $set: { position: update.position } },
        },
    }));
    return await Product_1.ProductModel.bulkWrite(bulkOps);
};
exports.default = bulkWrite;
//# sourceMappingURL=bulkWrite.js.map