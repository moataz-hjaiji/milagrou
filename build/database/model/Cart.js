"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModel = exports.CartAction = exports.CART_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const User_1 = require("./User");
const Product_1 = require("./Product");
const Supplement_1 = require("./Supplement");
exports.CART_DOCUMENT_NAME = 'Cart';
const CART_COLLECTION_NAME = 'Carts';
var CartAction;
(function (CartAction) {
    CartAction["PLUS"] = "PLUS";
    CartAction["MINUS"] = "MINUS";
})(CartAction = exports.CartAction || (exports.CartAction = {}));
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => User_1.USER_DOCUMENT_NAME,
    },
    items: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: () => Product_1.PRODUCT_DOCUMENT_NAME,
            },
            supplements: [
                {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: () => Supplement_1.SUPPLEMENT_DOCUMENT_NAME,
                },
            ],
            quantity: {
                type: Number,
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
exports.CartModel = (0, mongoose_1.model)(exports.CART_DOCUMENT_NAME, schema, CART_COLLECTION_NAME);
//# sourceMappingURL=Cart.js.map