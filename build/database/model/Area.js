"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaModel = exports.AREA_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Governorate_1 = require("./Governorate");
exports.AREA_DOCUMENT_NAME = 'Area';
const AREA_COLLECTION_NAME = 'Areas';
const schema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String,
    },
    governorateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => Governorate_1.GOVERNORATE_DOCUMENT_NAME,
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
exports.AreaModel = (0, mongoose_1.model)(exports.AREA_DOCUMENT_NAME, schema, AREA_COLLECTION_NAME);
//# sourceMappingURL=Area.js.map