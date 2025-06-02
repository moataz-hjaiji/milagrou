"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const AddressRepo_1 = __importDefault(require("../../database/repository/AddressRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const address = await AddressRepo_1.default.findById(id, query);
    if (!address)
        throw new ApiError_1.BadRequestError('Address not found');
    return address;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map