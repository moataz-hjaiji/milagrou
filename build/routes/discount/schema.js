"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
const Discount_1 = require("../../database/model/Discount");
const validator_1 = require("../../helpers/utils/validator");
exports.default = {
    param: joi_1.default.object().keys({
        id: (0, validator_1.JoiObjectId)().required(),
    }),
    create: joi_1.default.object().keys({
        target: joi_1.default.object({
            menuId: (0, validator_1.JoiObjectId)(),
            categoryId: (0, validator_1.JoiObjectId)(),
            subCategoryId: (0, validator_1.JoiObjectId)(),
            productId: (0, validator_1.JoiObjectId)(),
        })
            .or('menuId', 'categoryId', 'subCategoryId', 'productId')
            .required(),
        startDate: joi_1.default.date().required(),
        endDate: joi_1.default.date().min(joi_1.default.ref('startDate')).required(),
        isActive: joi_1.default.boolean().required(),
        amount: joi_1.default.number().positive().required(),
        type: joi_1.default.string()
            .valid(...Object.values(Discount_1.DiscountType))
            .required()
            .custom((value, helpers) => {
            const { amount } = helpers.state.ancestors[0];
            if (value === Discount_1.DiscountType.PERCENTAGE && amount > 100) {
                return helpers.error('any.invalid');
            }
            return value;
        }, 'percentage validation'),
    }),
    update: joi_1.default.object().keys({
        startDate: joi_1.default.date(),
        endDate: joi_1.default.date().min(joi_1.default.ref('startDate')),
        isActive: joi_1.default.boolean(),
        amount: joi_1.default.number().positive(),
        type: joi_1.default.string()
            .valid(...Object.values(Discount_1.DiscountType))
            .custom((value, helpers) => {
            const { amount } = helpers.state.ancestors[0];
            if (value === Discount_1.DiscountType.PERCENTAGE && amount > 100) {
                return helpers.error('any.invalid');
            }
            return value;
        }, 'percentage validation'),
    }),
};
//# sourceMappingURL=schema.js.map