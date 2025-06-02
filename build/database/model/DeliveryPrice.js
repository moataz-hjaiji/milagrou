"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPriceModel = exports.DELIVERY_PRICE_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
exports.DELIVERY_PRICE_DOCUMENT_NAME = 'DeliveryPrice';
const DELIVERY_PRICE_COLLECTION_NAME = 'DeliveryPrices';
const schema = new mongoose_1.Schema({
    price: {
        type: mongoose_1.Schema.Types.Number,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    freeDeliveryOption: {
        type: Boolean,
        default: false,
    },
    freeAfter: {
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
(0, databaseHooks_1.preFindHook)(schema);
schema.plugin(mongoose_paginate_ts_1.mongoosePagination);
exports.DeliveryPriceModel = (0, mongoose_1.model)(exports.DELIVERY_PRICE_DOCUMENT_NAME, schema, DELIVERY_PRICE_COLLECTION_NAME);
//# sourceMappingURL=DeliveryPrice.js.map