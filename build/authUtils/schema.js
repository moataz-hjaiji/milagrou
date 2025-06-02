"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
const validator_1 = require("../helpers/utils/validator");
exports.default = {
    apiKey: joi_1.default.object()
        .keys({
        'x-api-key': joi_1.default.string().required(),
    })
        .unknown(true),
    auth: joi_1.default.object()
        .keys({
        authorization: (0, validator_1.JoiAuthBearer)().required(),
    })
        .unknown(true),
};
//# sourceMappingURL=schema.js.map