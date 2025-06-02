"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../model/User");
const apiFeatures_1 = __importDefault(require("../../../helpers/utils/apiFeatures"));
const findAll = async (paging, query) => {
    let findAllQuery = User_1.UserModel.find({ deletedAt: null });
    const features = new apiFeatures_1.default(findAllQuery, query)
        .filter()
        .sort()
        .recherche(['userName', 'phoneNumber'])
        .limitFields()
        .populate();
    const options = {
        query: features.query,
        limit: paging.limit ? paging.limit : null,
        page: paging.page ? paging.page : null,
    };
    return (await User_1.UserModel.paginate(options));
};
exports.default = findAll;
//# sourceMappingURL=findAll.js.map