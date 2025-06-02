"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDelete = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let seedDelete = async () => {
    const collections = mongoose_1.default.modelNames();
    const deletedCollections = collections.map((collection) => mongoose_1.default.models[collection].deleteMany({}));
    await Promise.all(deletedCollections);
    console.log('Collections empty successfully ');
};
exports.seedDelete = seedDelete;
//# sourceMappingURL=drop.js.map