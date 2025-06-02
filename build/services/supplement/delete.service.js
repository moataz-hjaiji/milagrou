"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const SupplementRepo_1 = __importDefault(require("../../database/repository/SupplementRepo"));
const ApiError_1 = require("../../core/ApiError");
const remove = async (id) => {
    const supplement = await SupplementRepo_1.default.remove(id);
    if (!supplement)
        throw new ApiError_1.BadRequestError('Supplement not found');
};
exports.remove = remove;
//# sourceMappingURL=delete.service.js.map