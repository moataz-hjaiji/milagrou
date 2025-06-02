"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_1 = __importDefault(require("./create"));
const find_1 = __importDefault(require("./find"));
const remove_1 = __importDefault(require("./remove"));
const findforKey_1 = __importDefault(require("./findforKey"));
const findKeysByObj_1 = __importDefault(require("./findKeysByObj"));
exports.default = {
    create: create_1.default,
    find: find_1.default,
    remove: remove_1.default,
    findforKey: findforKey_1.default,
    findKeysByObj: findKeysByObj_1.default,
};
//# sourceMappingURL=index.js.map