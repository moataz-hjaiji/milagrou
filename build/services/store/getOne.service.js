"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const StoreRepo_1 = __importDefault(require("../../database/repository/StoreRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const store = await StoreRepo_1.default.findById(id, query);
    if (!store)
        throw new ApiError_1.BadRequestError('Store not found');
    return store;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map