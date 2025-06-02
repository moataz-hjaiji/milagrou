"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const StoreRepo_1 = __importDefault(require("../../database/repository/StoreRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const store = await StoreRepo_1.default.update(id, body);
    if (!store)
        throw new ApiError_1.BadRequestError('store not found');
    return store;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map