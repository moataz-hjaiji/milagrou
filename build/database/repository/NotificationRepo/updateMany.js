"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = require("../../model/Notification");
const update = async (condition, obj) => {
    return await Notification_1.NotificationModel.updateMany(condition, { $set: { ...obj } }, { new: true }).exec();
};
exports.default = update;
//# sourceMappingURL=updateMany.js.map