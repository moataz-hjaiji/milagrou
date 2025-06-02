"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = exports.NOTIFICATION_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Category_1 = require("./Category");
const Order_1 = require("./Order");
const Product_1 = require("./Product");
const User_1 = require("./User");
exports.NOTIFICATION_DOCUMENT_NAME = 'Notification';
const NOTIFICATION_COLLECTION_NAME = 'Notifications';
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => User_1.USER_DOCUMENT_NAME,
    },
    title: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    body: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    data: {
        orderId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => Order_1.ORDER_DOCUMENT_NAME,
        },
        categoryId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => Category_1.CATEGORY_DOCUMENT_NAME,
        },
        ProductId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => Product_1.PRODUCT_DOCUMENT_NAME,
        },
    },
    isRead: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false,
    },
    isSeen: {
        type: mongoose_1.Schema.Types.Boolean,
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
exports.NotificationModel = (0, mongoose_1.model)(exports.NOTIFICATION_DOCUMENT_NAME, schema, NOTIFICATION_COLLECTION_NAME);
//# sourceMappingURL=Notification.js.map