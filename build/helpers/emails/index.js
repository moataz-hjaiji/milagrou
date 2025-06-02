"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const configVars_1 = require("../../configVars");
const Logger_1 = __importDefault(require("../../core/Logger"));
const sendEmail = async (options, smtpService = 'gmail', html = false) => {
    let transporter;
    if (smtpService === 'gmail') {
        transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: configVars_1.email.smtpUser,
                pass: configVars_1.email.smtpPass,
            },
        });
    }
    else {
        transporter = nodemailer_1.default.createTransport({
            host: configVars_1.email.smtpHost,
            port: Number(configVars_1.email.smtpPort),
            secure: true,
            auth: {
                user: configVars_1.email.smtpUser,
                pass: configVars_1.email.smtpPass,
            },
        });
    }
    const mailOptions = {
        from: `${configVars_1.email.smtpUser}`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: '',
    };
    if (!options.template) {
        transporter.sendMail(mailOptions, (err, res) => {
            if (err) {
                Logger_1.default.error(err);
            }
            else {
                Logger_1.default.info('Email sent');
            }
        });
    }
    else {
        const html = await ejs_1.default.renderFile(`${__dirname}/templates/${options.template}.ejs`, {
            // Just give the file name of the template, without the extension
            name: options.email,
            variables: options.variables,
        });
        mailOptions.html = html;
        transporter.sendMail(mailOptions, (err, res) => {
            if (err) {
                Logger_1.default.error(err);
            }
            else {
                Logger_1.default.info('Email sent');
            }
        });
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=index.js.map