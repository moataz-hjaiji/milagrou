"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.USER_DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_paginate_ts_1 = require("mongoose-paginate-ts");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const databaseHooks_1 = require("../../helpers/utils/databaseHooks");
const Role_1 = require("./Role");
exports.USER_DOCUMENT_NAME = 'User';
const USER_COLLECTION_NAME = 'Users';
const schema = new mongoose_1.Schema({
    firstName: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    lastName: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    email: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
        set: (value) => value.toLocaleLowerCase(),
    },
    password: {
        type: mongoose_1.Schema.Types.String,
        select: false,
    },
    phoneNumber: {
        type: mongoose_1.Schema.Types.String,
        trim: true,
    },
    avatar: {
        type: mongoose_1.Schema.Types.String,
        default: 'public/avatar-default-icon.png',
    },
    verified: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false,
    },
    emailIsVerified: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false,
    },
    registerConfirmationCode: {
        type: mongoose_1.Schema.Types.Number,
        select: false,
    },
    forgetConfirmationCode: {
        type: mongoose_1.Schema.Types.Number,
        select: false,
    },
    roles: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: () => Role_1.ROLE_DOCUMENT_NAME,
            select: false,
        },
    ],
    lastLogin: {
        type: Date,
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
schema.pre('save', async function (next) {
    var _a;
    if (this.isModified('email'))
        this.email = (_a = this.email) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase();
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
schema.methods.comparePassword = async function (password) {
    return await bcryptjs_1.default.compare(password, this.password);
};
exports.UserModel = (0, mongoose_1.model)(exports.USER_DOCUMENT_NAME, schema, USER_COLLECTION_NAME);
//# sourceMappingURL=User.js.map