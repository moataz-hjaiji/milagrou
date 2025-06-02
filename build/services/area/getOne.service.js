"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = void 0;
const AreaRepo_1 = __importDefault(require("../../database/repository/AreaRepo"));
const ApiError_1 = require("../../core/ApiError");
const getOne = async (id, query) => {
    const area = await AreaRepo_1.default.findById(id, query);
    if (!area)
        throw new ApiError_1.BadRequestError('Area not found');
    return area;
};
exports.getOne = getOne;
//# sourceMappingURL=getOne.service.js.map