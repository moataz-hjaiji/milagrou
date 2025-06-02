"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDataNotifUserMessage = exports.sendNotifUser = void 0;
const google_auth_library_1 = require("google-auth-library");
const axios_1 = __importDefault(require("axios"));
const NotificationRepo_1 = __importDefault(require("../../database/repository/NotificationRepo"));
const configVars_1 = require("../../configVars");
const getAccessToken = () => {
    return new Promise(function (resolve, reject) {
        const jwtClient = new google_auth_library_1.JWT(configVars_1.NotificationConfig.client_email, undefined, configVars_1.NotificationConfig.private_key, ['https://www.googleapis.com/auth/firebase.messaging'], undefined);
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
};
const sendNotif = async (token, title, body, data, topic) => {
    try {
        const headers = {
            Authorization: 'Bearer ' + token,
        };
        const payload = {
            message: {
                topic,
                notification: {
                    title,
                    body,
                },
                data,
            },
        };
        return await (0, axios_1.default)({
            method: 'post',
            url: `https://fcm.googleapis.com/v1/projects/${configVars_1.NotificationConfig.project_id}/messages:send`,
            data: payload,
            headers,
        });
    }
    catch (error) {
        console.log(error.message);
    }
};
const sendDataNotif = async (token, data, topic) => {
    try {
        const headers = {
            Authorization: 'Bearer ' + token,
        };
        const payload = {
            message: {
                topic,
                data,
            },
        };
        return await (0, axios_1.default)({
            method: 'post',
            url: `https://fcm.googleapis.com/v1/projects/${configVars_1.NotificationConfig.project_id}/messages:send`,
            data: payload,
            headers,
        });
    }
    catch (error) {
        console.log(error.message);
    }
};
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const sendNotifUser = async (userId, content) => {
    const token = (await getAccessToken());
    await sendDataNotif(token, content.data, userId);
    await NotificationRepo_1.default.create({
        userId,
        title: content.data.title,
        body: content.data.body,
        data: content.data,
    });
};
exports.sendNotifUser = sendNotifUser;
const sendDataNotifUserMessage = async (userId, content) => {
    const token = (await getAccessToken());
    await sendDataNotif(token, content.data, userId);
};
exports.sendDataNotifUserMessage = sendDataNotifUserMessage;
//# sourceMappingURL=index.js.map