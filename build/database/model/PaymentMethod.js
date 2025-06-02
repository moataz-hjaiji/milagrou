"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodModel = exports.PAYMENT_METHOD_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
exports.PAYMENT_METHOD_DOCUMENT_NAME = 'PaymentMethod';
const PAYMENT_METHOD_COLLECTION_NAME = 'PaymentMethods';
const schema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    description: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
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
exports.PaymentMethodModel = (0, mongoose_1.model)(exports.PAYMENT_METHOD_DOCUMENT_NAME, schema, PAYMENT_METHOD_COLLECTION_NAME);
//# sourceMappingURL=PaymentMethod.js.map