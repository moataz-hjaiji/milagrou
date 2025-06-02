"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeystoreModel = exports.KEYSTORE_DOCUMENT_NAME = void 0;
/* eslint-disable prettier/prettier */
const mongoose_1 = require("mongoose");
const User_1 = require("./User");
exports.KEYSTORE_DOCUMENT_NAME = 'Keystore';
const KEYSTORE_COLLECTION_NAME = 'Keystores';
const schema = new mongoose_1.Schema({
    client: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: () => User_1.USER_DOCUMENT_NAME,
    },
    primaryKey: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
    secondaryKey: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
schema.index({ client: 1, primaryKey: 1 });
schema.index({ client: 1, primaryKey: 1, secondaryKey: 1 });
exports.KeystoreModel = (0, mongoose_1.model)(exports.KEYSTORE_DOCUMENT_NAME, schema, KEYSTORE_COLLECTION_NAME);
//# sourceMappingURL=Keystore.js.map