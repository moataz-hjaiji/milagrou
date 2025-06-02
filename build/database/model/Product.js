"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = exports.PRODUCT_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Category_1 = require("./Category");
const Store_1 = require("./Store");
const Supplement_1 = require("./Supplement");
exports.PRODUCT_DOCUMENT_NAME = 'Product';
const PRODUCT_COLLECTION_NAME = 'Products';
const schema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    description: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    images: [
        {
            type: mongoose_1.Schema.Types.String,
            trim: true,
        },
    ],
    position: {
        type: mongoose_1.Schema.Types.Number,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => Category_1.CATEGORY_DOCUMENT_NAME,
    },
    price: {
        type: mongoose_1.Schema.Types.Number,
    },
    stores: [
        {
            store: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: () => Store_1.STORE_DOCUMENT_NAME,
            },
            quantity: {
                type: mongoose_1.Schema.Types.Number,
            },
        },
    ],
    supplements: [
        {
            supplement: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: () => Supplement_1.SUPPLEMENT_DOCUMENT_NAME,
            },
            price: {
                type: mongoose_1.Schema.Types.Number,
            },
        },
    ],
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
exports.ProductModel = (0, mongoose_1.model)(exports.PRODUCT_DOCUMENT_NAME, schema, PRODUCT_COLLECTION_NAME);
//# sourceMappingURL=Product.js.map