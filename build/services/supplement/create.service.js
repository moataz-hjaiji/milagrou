"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const ApiError_1 = require("../../core/ApiError");
const SupplementRepo_1 = __importDefault(require("../../database/repository/SupplementRepo"));
const create = async ({ body, file }) => {
    if (file)
        body.image = file.path;
    const supplement = await SupplementRepo_1.default.create(body);
    if (!supplement)
        throw new ApiError_1.BadRequestError('error creating supplement');
    return supplement;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map