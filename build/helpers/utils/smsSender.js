"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTwilioMessage = void 0;
const twilio_1 = __importDefault(require("twilio"));
const configVars_1 = require("../../configVars");
const sendTwilioMessage = async (messageSettings) => {
    const { accountSid, authToken, phoneNumber } = configVars_1.twilioSettings;
    const client = (0, twilio_1.default)(accountSid, authToken);
    const messageCreateOptions = {
        body: messageSettings.body,
        from: phoneNumber,
        to: messageSettings.to,
    };
    await client.messages
        .create(messageCreateOptions) // Type assertion for MessageCreateOptions
        .then((message) => {
        return message.sid;
    })
        .catch((error) => {
        console.error(`Error sending message: ${error.message}`);
        throw error;
    });
};
exports.sendTwilioMessage = sendTwilioMessage;
//# sourceMappingURL=smsSender.js.map