"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountModel = exports.DiscountType = exports.DISCOUNT_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Category_1 = require("./Category");
const Product_1 = require("./Product");
exports.DISCOUNT_DOCUMENT_NAME = 'Discount';
const DISCOUNT_COLLECTION_NAME = 'Discounts';
var DiscountType;
(function (DiscountType) {
    DiscountType["AMOUNT"] = "AMOUNT";
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
})(DiscountType = exports.DiscountType || (exports.DiscountType = {}));
const schema = new mongoose_1.Schema({
    target: {
        categoryId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => Category_1.CATEGORY_DOCUMENT_NAME,
        },
        productId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => Product_1.PRODUCT_DOCUMENT_NAME,
        },
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    type: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
        select: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
(0, databaseHooks_1.preFindHook)(schema);
schema.plugin(mongoose_paginate_ts_1.mongoosePagination);
exports.DiscountModel = (0, mongoose_1.model)(exports.DISCOUNT_DOCUMENT_NAME, schema, DISCOUNT_COLLECTION_NAME);
//# sourceMappingURL=Discount.js.map