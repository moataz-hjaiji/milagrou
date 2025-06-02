"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkout_service_1 = require("./checkout.service");
const getAll_service_1 = require("./getAll.service");
const getOne_service_1 = require("./getOne.service");
const update_service_1 = require("./update.service");
const delete_service_1 = require("./delete.service");
const cancelOrder_service_1 = require("./cancelOrder.service");
exports.default = {
    checkout: checkout_service_1.checkout,
    getAll: getAll_service_1.getAll,
    getOne: getOne_service_1.getOne,
    update: update_service_1.update,
    remove: delete_service_1.remove,
    cancelOrder: cancelOrder_service_1.cancelOrder,
};
//# sourceMappingURL=index.js.map