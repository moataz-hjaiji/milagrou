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
        areaId: (0, validator_1.JoiObjectId)().required(),
        block: joi_1.default.string().required(),
        street: joi_1.default.string().required(),
        buildingNumber: joi_1.default.number(),
        specialDirection: joi_1.default.string(),
    }),
    update: joi_1.default.object().keys({
        userId: (0, validator_1.JoiObjectId)(),
        areaId: (0, validator_1.JoiObjectId)(),
        block: joi_1.default.string(),
        street: joi_1.default.string(),
        buildingNumber: joi_1.default.number(),
        specialDirection: joi_1.default.string(),
    }),
};
//# sourceMappingURL=schema.js.map