"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const UserRepo_1 = __importDefault(require("../../database/repository/UserRepo"));
const ApiError_1 = require("../../core/ApiError");
const lodash_1 = require("lodash");
const create = async ({ body, file }) => {
    if (file)
        body.avatar = file.path;
    const userCheck = await UserRepo_1.default.findByObj({
        $or: [{ email: body.email }, { phoneNumber: body.phoneNumber }],
    });
    if (userCheck === null || userCheck === void 0 ? void 0 : userCheck.verified) {
        throw new ApiError_1.BadRequestError('user with that phone number aleardy exists');
    }
    else if (userCheck && !(userCheck === null || userCheck === void 0 ? void 0 : userCheck.verified)) {
        throw new ApiError_1.BadRequestError('unverified User with that phone number aleardy exists');
    }
    const user = await UserRepo_1.default.create({
        ...body,
    });
    if (!user)
        throw new ApiError_1.BadRequestError('error creating user');
    const filteredUser = (0, lodash_1.omit)(user.toObject(), ['password']);
    return filteredUser;
};
exports.create = create;
//# sourceMappingURL=create.service.js.map