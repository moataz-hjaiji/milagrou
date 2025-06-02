"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = require("../../model/Notification");
const remove = async (id) => {
    return await Notification_1.NotificationModel.findByIdAndUpdate(id, { $set: { deletedAt: Date.now() } }, { new: true }).exec();
};
exports.default = remove;
//# sourceMappingURL=remove.js.map