"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const AreaRepo_1 = __importDefault(require("../../database/repository/AreaRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body }) => {
    const area = await AreaRepo_1.default.update(id, body);
    if (!area)
        throw new ApiError_1.BadRequestError('area not found');
    return area;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map