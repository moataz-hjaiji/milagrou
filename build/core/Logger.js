"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const configVars_1 = require("../configVars");
const logLevel = configVars_1.environment === 'development' ? 'debug' : 'warn';
let dir = configVars_1.logDirectory;
if (!dir)
    dir = path_1.default.resolve('logs');
// create directory if it is not present
if (!fs_1.default.existsSync(dir)) {
    fs_1.default.mkdirSync(dir);
}
const consoleFormat = winston_1.format.combine(winston_1.format.errors({ stack: true }), winston_1.format.timestamp(), winston_1.format.printf(({ level, message, timestamp }) => {
    let emoji = '';
    let logLevel = level.toUpperCase(); // Default log level without color
    switch (level) {
        case 'info':
            logLevel = `\x1b[36m${logLevel}\x1b[0m`; // Cyan color
            break;
        case 'debug':
            logLevel = `\x1b[34m${logLevel}\x1b[0m`; // Blue color
            break;
        case 'warn':
            logLevel = `\x1b[33m${logLevel}\x1b[0m`; // Yellow color
            break;
        case 'error':
            logLevel = `\x1b[31m${logLevel}\x1b[0m`; // Red color
            break;
        default:
            emoji = '';
            break;
    }
    return `[${timestamp}] ${logLevel} ${emoji} \t${message}`;
}));
const options = {
    file: {
        level: logLevel,
        filename: dir + '/%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        timestamp: true,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        prettyPrint: true,
        json: true,
        maxSize: '20m',
        maxFiles: '14d',
    },
};
exports.default = (0, winston_1.createLogger)({
    transports: [
        new winston_1.transports.Console({
            level: logLevel,
            format: consoleFormat,
        }),
    ],
    exceptionHandlers: [new winston_daily_rotate_file_1.default(options.file)],
    exitOnError: false,
    silent: configVars_1.environment === 'test' ? true : false,
});
//# sourceMappingURL=Logger.js.map