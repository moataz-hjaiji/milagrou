"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplementModel = exports.SUPPLEMENT_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
exports.SUPPLEMENT_DOCUMENT_NAME = 'Supplement';
const SUPPLEMENT_COLLECTION_NAME = 'Supplements';
const schema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    image: {
        type: mongoose_1.Schema.Types.String,
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
exports.SupplementModel = (0, mongoose_1.model)(exports.SUPPLEMENT_DOCUMENT_NAME, schema, SUPPLEMENT_COLLECTION_NAME);
//# sourceMappingURL=Supplement.js.map