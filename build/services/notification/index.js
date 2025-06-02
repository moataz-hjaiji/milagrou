"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAll_service_1 = require("./getAll.service");
const getOne_service_1 = require("./getOne.service");
const update_service_1 = require("./update.service");
const markAllAsSeen_service_1 = require("./markAllAsSeen.service");
const subscribeToTopic_service_1 = require("./subscribeToTopic.service");
const unsubscribeFromTopic_service_1 = require("./unsubscribeFromTopic.service");
exports.default = {
    getAll: getAll_service_1.getAll,
    getOne: getOne_service_1.getOne,
    update: update_service_1.update,
    markAllAsSeen: markAllAsSeen_service_1.markAllAsSeen,
    subscribeToTopic: subscribeToTopic_service_1.subscribeToTopic,
    unsubscribeFromTopic: unsubscribeFromTopic_service_1.unsubscribeFromTopic,
};
//# sourceMappingURL=index.js.map