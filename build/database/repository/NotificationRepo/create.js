"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = require("../../model/Notification");
const create = async (obj) => {
    return await Notification_1.NotificationModel.create(obj);
};
exports.default = create;
//# sourceMappingURL=create.js.map