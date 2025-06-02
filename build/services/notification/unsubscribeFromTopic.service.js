"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeFromTopic = void 0;
const ApiError_1 = require("../../core/ApiError");
const initializeApp_1 = require("../../helpers/notif/initializeApp");
const unsubscribeFromTopic = async (token, topic) => {
    try {
        await initializeApp_1.firebase.messaging().unsubscribeFromTopic(token, topic);
    }
    catch (error) {
        throw new ApiError_1.BadRequestError('error while unsubscribing to topic');
    }
};
exports.unsubscribeFromTopic = unsubscribeFromTopic;
//# sourceMappingURL=unsubscribeFromTopic.service.js.map