"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const SupplementRepo_1 = __importDefault(require("../../database/repository/SupplementRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const supplement = await SupplementRepo_1.default.findById(id, query);
    if (!supplement)
        throw new ApiError_1.BadRequestError('Supplement not found');
    return supplement;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map