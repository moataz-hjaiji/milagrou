"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModel = exports.CATEGORY_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const checkDuplecateKey_1 = require("../../helpers/utils/checkDuplecateKey");
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
exports.CATEGORY_DOCUMENT_NAME = 'Category';
const CATEGORY_COLLECTION_NAME = 'Categories';
const schema = new mongoose_1.Schema({
    name: {
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
schema.pre('save', async function (next) {
    await (0, checkDuplecateKey_1.checkDuplicateKey)('name', this.name, exports.CategoryModel, this._id);
    next();
});
schema.pre('findOneAndUpdate', async function (next) {
    var _a;
    const update = this.getUpdate();
    const id = this.getQuery()._id;
    const name = (_a = update === null || update === void 0 ? void 0 : update.$set) === null || _a === void 0 ? void 0 : _a.name;
    if (name)
        await (0, checkDuplecateKey_1.checkDuplicateKey)('name', name, exports.CategoryModel, id);
    next();
});
(0, databaseHooks_1.preFindHook)(schema);
schema.plugin(mongoose_paginate_ts_1.mongoosePagination);
exports.CategoryModel = (0, mongoose_1.model)(exports.CATEGORY_DOCUMENT_NAME, schema, CATEGORY_COLLECTION_NAME);
//# sourceMappingURL=Category.js.map