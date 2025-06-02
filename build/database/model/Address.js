"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressModel = exports.ADDRESS_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Area_1 = require("./Area");
const User_1 = require("./User");
exports.ADDRESS_DOCUMENT_NAME = 'Address';
const ADDRESS_COLLECTION_NAME = 'Addresses';
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => User_1.USER_DOCUMENT_NAME,
    },
    areaId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: () => Area_1.AREA_DOCUMENT_NAME,
    },
    block: {
        type: mongoose_1.Schema.Types.String,
    },
    street: {
        type: mongoose_1.Schema.Types.String,
    },
    buildingNumber: {
        type: mongoose_1.Schema.Types.Number,
    },
    specialDirection: {
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
exports.AddressModel = (0, mongoose_1.model)(exports.ADDRESS_DOCUMENT_NAME, schema, ADDRESS_COLLECTION_NAME);
//# sourceMappingURL=Address.js.map