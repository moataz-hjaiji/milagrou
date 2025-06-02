"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discount_1 = require("../../model/Discount");
const apiFeatures_1 = __importDefault(require("../../../helpers/utils/apiFeatures"));
const findAll = async (paging, query) => {
    let findAllQuery = Discount_1.DiscountModel.find({ deletedAt: null });
    const features = new apiFeatures_1.default(findAllQuery, query)
        .filter()
        .sort()
        .recherche([''])
        .limitFields()
        .populate();
    const options = {
        query: features.query,
        limit: paging.limit ? paging.limit : null,
        page: paging.page ? paging.page : null,
    };
    return (await Discount_1.DiscountModel.paginate(options));
};
exports.default = findAll;
//# sourceMappingURL=findAll.js.map