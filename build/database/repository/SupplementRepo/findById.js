"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiFeatures_1 = __importDefault(require("../../../helpers/utils/apiFeatures"));
const Supplement_1 = require("../../model/Supplement");
const findById = async (id, queryString) => {
    let findOneQuery = Supplement_1.SupplementModel.findById(id);
    const features = new apiFeatures_1.default(findOneQuery, queryString)
        .limitFields()
        .populate();
    return await features.query.exec();
};
exports.default = findById;
//# sourceMappingURL=findById.js.map