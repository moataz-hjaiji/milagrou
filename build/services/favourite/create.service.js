"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const AddressRepo_1 = __importDefault(require("../../database/repository/AddressRepo"));
const create = async ({ body }) => {
    const address = await AddressRepo_1.default.create(body);
    if (!address)
        throw new ApiError_1.BadRequestError('error creating address');
    return address;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map