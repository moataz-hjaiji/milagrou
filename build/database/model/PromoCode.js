"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodeModel = exports.PROMO_CODE_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const User_1 = require("./User");
exports.PROMO_CODE_DOCUMENT_NAME = 'PromoCode';
const PROMO_CODE_COLLECTION_NAME = 'PromoCodes';
const schema = new mongoose_1.Schema({
    code: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
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
    oneTimeUse: {
        type: Boolean,
        default: false,
    },
    users: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => User_1.USER_DOCUMENT_NAME,
        },
    ],
    maxUsage: {
        type: Number,
    },
    actualUsage: {
        type: Number,
        default: 0,
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
exports.PromoCodeModel = (0, mongoose_1.model)(exports.PROMO_CODE_DOCUMENT_NAME, schema, PROMO_CODE_COLLECTION_NAME);
//# sourceMappingURL=PromoCode.js.map