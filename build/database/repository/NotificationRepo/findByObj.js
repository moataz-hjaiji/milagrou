"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = require("../../model/Notification");
const findByObj = (obj) => {
    return Notification_1.NotificationModel.findOne(obj).exec();
};
exports.default = findByObj;
//# sourceMappingURL=findByObj.js.map