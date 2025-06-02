"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = exports.ROLE_DOCUMENT_NAME = void 0;
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const mongoose_1 = require("mongoose");
const Permission_1 = require("./Permission");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
exports.ROLE_DOCUMENT_NAME = 'Role';
const ROLE_COLLECTION_NAME = 'Roles';
const schema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
    permissions: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => Permission_1.PERMISSION_DOCUMENT_NAME,
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
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
exports.RoleModel = (0, mongoose_1.model)(exports.ROLE_DOCUMENT_NAME, schema, ROLE_COLLECTION_NAME);
//# sourceMappingURL=Role.js.map