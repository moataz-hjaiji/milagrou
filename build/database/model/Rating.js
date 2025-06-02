"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingModel = exports.RATING_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Product_1 = require("./Product");
const User_1 = require("./User");
exports.RATING_DOCUMENT_NAME = 'Rating';
const RATING_COLLECTION_NAME = 'Ratings';
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => User_1.USER_DOCUMENT_NAME,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => Product_1.PRODUCT_DOCUMENT_NAME,
    },
    rating: {
        type: mongoose_1.Schema.Types.Number,
    },
    comment: {
        type: mongoose_1.Schema.Types.String,
    },
    isAccepted: {
        type: mongoose_1.Schema.Types.Boolean,
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
exports.RatingModel = (0, mongoose_1.model)(exports.RATING_DOCUMENT_NAME, schema, RATING_COLLECTION_NAME);
//# sourceMappingURL=Rating.js.map