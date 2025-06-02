"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
const validator_1 = require("../../helpers/utils/validator");
const Cart_1 = require("../../database/model/Cart");
exports.default = {
    param: joi_1.default.object().keys({
        id: (0, validator_1.JoiObjectId)().required(),
    }),
    addToCart: joi_1.default.object().keys({
        product: (0, validator_1.JoiObjectId)().required(),
        quantity: joi_1.default.number().integer().min(1).required(),
        selectedSupplements: joi_1.default.array().items(joi_1.default.object().keys({
            supplementCategory: (0, validator_1.JoiObjectId)().required(),
            supplements: joi_1.default.array()
                .items(joi_1.default.object().keys({
                supplement: (0, validator_1.JoiObjectId)().required(),
            }))
                .min(1)
                .required(),
        })),
        notes: joi_1.default.string(),
    }),
    incrementOrDecrement: joi_1.default.object().keys({
        itemId: (0, validator_1.JoiObjectId)().required(),
        action: joi_1.default.string()
            .valid(...Object.values(Cart_1.CartAction))
            .required(),
    }),
    removeFromCart: joi_1.default.object().keys({
        itemId: (0, validator_1.JoiObjectId)().required(),
    }),
    editItem: joi_1.default.object().keys({
        itemId: (0, validator_1.JoiObjectId)().required(),
        item: joi_1.default.object().keys({
            selectedSupplements: joi_1.default.array().items(joi_1.default.object().keys({
                supplementCategory: (0, validator_1.JoiObjectId)().required(),
                supplements: joi_1.default.array()
                    .items(joi_1.default.object().keys({
                    supplement: (0, validator_1.JoiObjectId)().required(),
                }))
                    .min(1)
                    .required(),
            })),
            notes: joi_1.default.string(),
        }),
    }),
};
//# sourceMappingURL=schema.js.map