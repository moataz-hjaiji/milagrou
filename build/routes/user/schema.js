"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
const validator_1 = require("../../helpers/utils/validator");
exports.default = {
    param: joi_1.default.object().keys({
        id: (0, validator_1.JoiObjectId)().required(),
    }),
    create: joi_1.default.object().keys({
        firstName: joi_1.default.string().min(3).required(),
        lastName: joi_1.default.string().min(3).required(),
        phoneNumber: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        verified: joi_1.default.boolean().required(),
        roles: joi_1.default.array().items((0, validator_1.JoiObjectId)()).required(),
    }),
    update: joi_1.default.object().keys({
        firstName: joi_1.default.string().min(3),
        lastName: joi_1.default.string().min(3),
        email: joi_1.default.string().email(),
        password: joi_1.default.string().min(8),
        verified: joi_1.default.boolean(),
        roles: joi_1.default.array().items((0, validator_1.JoiObjectId)()),
    }),
    updateMe: joi_1.default.object().keys({
        firstName: joi_1.default.string().min(3),
        lastName: joi_1.default.string().min(3),
    }),
};
//# sourceMappingURL=schema.js.map