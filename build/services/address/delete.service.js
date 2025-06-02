"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const AddressRepo_1 = __importDefault(require("../../database/repository/AddressRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const address = await AddressRepo_1.default.remove(id);
    if (!address)
        throw new ApiError_1.BadRequestError('Address not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map