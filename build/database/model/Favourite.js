"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavouriteModel = exports.FAVOURITE_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Product_1 = require("./Product");
const User_1 = require("./User");
exports.FAVOURITE_DOCUMENT_NAME = 'Favourite';
const FAVOURITE_COLLECTION_NAME = 'Favourites';
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => User_1.USER_DOCUMENT_NAME,
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => Product_1.PRODUCT_DOCUMENT_NAME,
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
exports.FavouriteModel = (0, mongoose_1.model)(exports.FAVOURITE_DOCUMENT_NAME, schema, FAVOURITE_COLLECTION_NAME);
//# sourceMappingURL=Favourite.js.map