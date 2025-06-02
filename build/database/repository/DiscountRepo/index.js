"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_1 = __importDefault(require("./create"));
const findAll_1 = __importDefault(require("./findAll"));
const findById_1 = __importDefault(require("./findById"));
const findByObj_1 = __importDefault(require("./findByObj"));
const update_1 = __importDefault(require("./update"));
const remove_1 = __importDefault(require("./remove"));
const findAllNotPaginated_1 = __importDefault(require("./findAllNotPaginated"));
exports.default = {
    create: create_1.default,
    findAll: findAll_1.default,
    findById: findById_1.default,
    findByObj: findByObj_1.default,
    update: update_1.default,
    remove: remove_1.default,
    findAllNotPaginated: findAllNotPaginated_1.default,
};
//# sourceMappingURL=index.js.map