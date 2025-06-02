"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const AddressRepo_1 = __importDefault(require("../../database/repository/AddressRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const address = await AddressRepo_1.default.update(id, body);
    if (!address)
        throw new ApiError_1.BadRequestError('address not found');
    return address;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map