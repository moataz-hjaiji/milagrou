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
        name: joi_1.default.string().min(3).required(),
        description: joi_1.default.string().min(3).required(),
        price: joi_1.default.number().required().min(0),
        position: joi_1.default.number().integer().min(0),
        category: (0, validator_1.JoiObjectId)().required(),
        stores: joi_1.default.array().items(joi_1.default.object({
            store: (0, validator_1.JoiObjectId)().required(),
            quantity: joi_1.default.number().min(0).required(),
        })),
        supplements: joi_1.default.array().items(joi_1.default.object({
            supplement: (0, validator_1.JoiObjectId)().required(),
            price: joi_1.default.number().min(0).required(),
        })),
    }),
    update: joi_1.default.object().keys({
        name: joi_1.default.string().min(3),
        description: joi_1.default.string().min(3),
        price: joi_1.default.number().min(0),
        position: joi_1.default.number().integer().min(0),
        category: (0, validator_1.JoiObjectId)(),
        stores: joi_1.default.array().items(joi_1.default.object({
            store: (0, validator_1.JoiObjectId)(),
            quantity: joi_1.default.number().min(0),
        })),
        supplements: joi_1.default.array().items(joi_1.default.object({
            supplement: (0, validator_1.JoiObjectId)(),
            price: joi_1.default.number().min(0),
        })),
    }),
    updatePosition: joi_1.default.object().keys({
        updates: joi_1.default.array()
            .items(joi_1.default.object({
            id: (0, validator_1.JoiObjectId)().required(),
            position: joi_1.default.number().integer().min(1).required(),
        }))
            .min(1)
            .required(),
    }),
};
//# sourceMappingURL=schema.js.map