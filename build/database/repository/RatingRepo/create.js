"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rating_1 = require("../../model/Rating");
const create = async (obj) => {
    return await Rating_1.RatingModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map