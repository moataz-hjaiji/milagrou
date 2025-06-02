"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const StoreRepo_1 = __importDefault(require("../../database/repository/StoreRepo"));
const create = async ({ body }) => {
    const store = await StoreRepo_1.default.create(body);
    if (!store)
        throw new ApiError_1.BadRequestError('error creating store');
    return store;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map