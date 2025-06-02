"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionModel = exports.PERMISSION_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
exports.PERMISSION_DOCUMENT_NAME = 'Permission';
const PERMISSION_COLLECTION_NAME = 'Permissions';
const schema = new mongoose_1.Schema({
    entity: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
    action: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
schema.plugin(mongoose_paginate_ts_1.mongoosePagination);
exports.PermissionModel = (0, mongoose_1.model)(exports.PERMISSION_DOCUMENT_NAME, schema, PERMISSION_COLLECTION_NAME);
//# sourceMappingURL=Permission.js.map