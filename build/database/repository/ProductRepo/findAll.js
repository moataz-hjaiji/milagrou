"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../model/Product");
const apiFeatures_1 = __importDefault(require("../../../helpers/utils/apiFeatures"));
const findAll = async (paging, query) => {
    let findAllQuery = Product_1.ProductModel.find({ deletedAt: null });
    const features = new apiFeatures_1.default(findAllQuery, query)
        .filter()
        .sort()
        .recherche(['name'])
        .limitFields()
        .populate();
    const options = {
        query: features.query,
        limit: paging.limit ? paging.limit : null,
        page: paging.page ? paging.page : null,
        populate: paging.populate,
    };
    return (await Product_1.ProductModel.paginate(options));
};
exports.default = findAll;
//# sourceMappingURL=findAll.js.map