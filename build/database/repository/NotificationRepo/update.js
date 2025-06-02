"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = require("../../model/Notification");
const update = async (id, obj) => {
    return await Notification_1.NotificationModel.findByIdAndUpdate(id, { $set: { ...obj } }, { new: true, runValidators: true, context: 'query' }).exec();
};
exports.default = update;
//# sourceMappingURL=update.js.map