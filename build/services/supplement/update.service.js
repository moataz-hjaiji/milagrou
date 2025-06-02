"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const SupplementRepo_1 = __importDefault(require("../../database/repository/SupplementRepo"));
const ApiError_1 = require("../../core/ApiError");
const update = async ({ id, body, file }) => {
    if (file)
        body.image = file.path;
    const supplement = await SupplementRepo_1.default.update(id, body);
    if (!supplement)
        throw new ApiError_1.BadRequestError('supplement not found');
    return supplement;
};
exports.update = update;
//# sourceMappingURL=update.service.js.map