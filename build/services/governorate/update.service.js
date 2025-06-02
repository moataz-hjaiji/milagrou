"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const GovernorateRepo_1 = __importDefault(require("../../database/repository/GovernorateRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const governorate = await GovernorateRepo_1.default.update(id, body);
    if (!governorate)
        throw new ApiError_1.BadRequestError('governorate not found');
    return governorate;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map