"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDuplicateKey = void 0;
const ApiError_1 = require("../../core/ApiError");
async function checkDuplicateKey(key, value, model, id) {
    const existingKey = await model.findOne({
        [key]: value,
        _id: { $ne: id },
    });
    if (existingKey)
        throw new ApiError_1.BadRequestError(`${model.modelName} with that ${key} already exists`);
}
exports.checkDuplicateKey = checkDuplicateKey;
//# sourceMappingURL=checkDuplecateKey.js.map