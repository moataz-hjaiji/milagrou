"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_service_1 = require("./create.service");
const getAll_service_1 = require("./getAll.service");
const getOne_service_1 = require("./getOne.service");
const delete_service_1 = require("./delete.service");
const update_service_1 = require("./update.service");
exports.default = {
    create: create_service_1.create,
    getAll: getAll_service_1.getAll,
    getOne: getOne_service_1.getOne,
    remove: delete_service_1.remove,
    update: update_service_1.update,
};
//# sourceMappingURL=index.js.map