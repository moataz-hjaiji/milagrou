"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_service_1 = require("./create.service");
const getAll_service_1 = require("./getAll.service");
const getOne_service_1 = require("./getOne.service");
const update_service_1 = require("./update.service");
const delete_service_1 = require("./delete.service");
const updatePosition_service_1 = require("./updatePosition.service");
exports.default = {
    create: create_service_1.create,
    getAll: getAll_service_1.getAll,
    getOne: getOne_service_1.getOne,
    update: update_service_1.update,
    remove: delete_service_1.remove,
    updatePosition: updatePosition_service_1.updatePosition,
};
//# sourceMappingURL=index.js.map