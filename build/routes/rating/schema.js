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
        userId: (0, validator_1.JoiObjectId)().required(),
        productId: (0, validator_1.JoiObjectId)().required(),
        rating: joi_1.default.number().min(1).max(5).multiple(1).required(),
        comment: joi_1.default.string().required(),
    }),
    update: joi_1.default.object().keys({
        isAccepted: joi_1.default.boolean(),
    }),
};
//# sourceMappingURL=schema.js.map