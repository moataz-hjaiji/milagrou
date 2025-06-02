"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = exports.ORDER_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Address_1 = require("./Address");
const PaymentMethod_1 = require("./PaymentMethod");
const Product_1 = require("./Product");
const User_1 = require("./User");
const PromoCode_1 = require("./PromoCode");
exports.ORDER_DOCUMENT_NAME = 'Order';
const ORDER_COLLECTION_NAME = 'Orders';
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => User_1.USER_DOCUMENT_NAME,
    },
    deliveryType: {
        type: mongoose_1.Schema.Types.String,
    },
    paymentMethodId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => PaymentMethod_1.PAYMENT_METHOD_DOCUMENT_NAME,
    },
    addressId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => Address_1.ADDRESS_DOCUMENT_NAME,
    },
    promoCodeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => PromoCode_1.PROMO_CODE_DOCUMENT_NAME,
    },
    status: {
        type: mongoose_1.Schema.Types.String,
        default: "PENDING" /* OrderStatus.PENDING */,
    },
    items: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: () => Product_1.PRODUCT_DOCUMENT_NAME,
            },
            quantity: {
                type: Number,
            },
            itemPrice: {
                type: Number,
            },
            notes: {
                type: mongoose_1.Schema.Types.String,
            },
        },
    ],
    orderPrice: {
        type: Number,
    },
    orderPriceWithoutDeliveryPrice: {
        type: Number,
    },
    newId: {
        type: Number,
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
schema.index({ location: '2dsphere' });
(0, databaseHooks_1.preFindHook)(schema);
schema.plugin(mongoose_paginate_ts_1.mongoosePagination);
exports.OrderModel = (0, mongoose_1.model)(exports.ORDER_DOCUMENT_NAME, schema, ORDER_COLLECTION_NAME);
//# sourceMappingURL=Order.js.map