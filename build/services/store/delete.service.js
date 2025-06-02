"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const StoreRepo_1 = __importDefault(require("../../database/repository/StoreRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const store = await StoreRepo_1.default.remove(id);
    if (!store)
        throw new ApiError_1.BadRequestError('Store not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map