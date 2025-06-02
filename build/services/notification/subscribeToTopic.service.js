"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToTopic = void 0;
const ApiError_1 = require("../../core/ApiError");
const initializeApp_1 = require("../../helpers/notif/initializeApp");
const subscribeToTopic = async (token, topic) => {
    try {
        await initializeApp_1.firebase.messaging().subscribeToTopic(token, topic);
    }
    catch (error) {
        console.log(error);
        throw new ApiError_1.BadRequestError('error while subscribing to topic');
    }
};
exports.subscribeToTopic = subscribeToTopic;
//# sourceMappingURL=subscribeToTopic.service.js.map