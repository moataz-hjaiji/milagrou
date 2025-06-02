"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const GovernorateRepo_1 = __importDefault(require("../../database/repository/GovernorateRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const governorate = await GovernorateRepo_1.default.findById(id, query);
    if (!governorate)
        throw new ApiError_1.BadRequestError('Governorate not found');
    return governorate;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map