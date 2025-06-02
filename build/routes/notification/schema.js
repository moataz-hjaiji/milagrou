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
    update: joi_1.default.object().keys({
        isRead: joi_1.default.boolean(),
    }),
    subscribeOrUnsubscribe: joi_1.default.object().keys({
        token: joi_1.default.string().required(),
        topic: joi_1.default.string().required(),
    }),
};
//# sourceMappingURL=schema.js.map