"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocumentsByUserId = exports.connect = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Logger_1 = __importDefault(require("../core/Logger"));
const configVars_1 = require("../configVars");
// Build the connection string
const dbURI = configVars_1.db.uri;
mongoose_1.default.set('strictQuery', false);
// Create the database connection
async function connect() {
    await mongoose_1.default
        .connect(dbURI)
        .then(() => {
        Logger_1.default.info('Mongoose connection done 👍');
    })
        .catch((e) => {
        Logger_1.default.info('Mongoose connection error');
        Logger_1.default.error(e);
    });
}
exports.connect = connect;
configVars_1.environment !== 'test' && connect(); // Connect to database only if not in test mode
// CONNECTION EVENTS
// When successfully connected
mongoose_1.default.connection.on('connected', () => {
    Logger_1.default.info('Mongoose default connection open to ' + configVars_1.db.host + ' 👍');
});
// If the connection throws an error
mongoose_1.default.connection.on('error', (err) => {
    Logger_1.default.error('Mongoose default connection error: ' + err);
});
// When the connection is disconnected
mongoose_1.default.connection.on('disconnected', () => {
    Logger_1.default.info('Mongoose default connection disconnected ');
});
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
    mongoose_1.default.connection.close();
    Logger_1.default.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
});
// Add the new function for deleting documents based on user ID
async function deleteDocumentsByUserId(userId) {
    try {
        const collections = mongoose_1.default.connection.collections;
        // Iterate through each collection and perform deleteMany
        for (const collectionName in collections) {
            // Skip certain collections if needed
            if (collectionName === 'users') {
                continue;
            }
            const collection = collections[collectionName];
            const userIdObject = new mongoose_1.Types.ObjectId(userId); // Convert userId to ObjectId
            const filter = {
                $or: [
                    { user: userIdObject },
                    { createdBy: userIdObject },
                    { organizer: userIdObject },
                    { teamInvited: userIdObject },
                    { user_id: userIdObject },
                    { sender: userIdObject },
                    { receiver: userIdObject },
                    { receiver_id: userIdObject },
                    { player_id: userIdObject },
                ],
            };
            // Perform deleteMany operation if a matching field is found
            const result = await collection.deleteMany(filter);
            if (result.deletedCount > 0) {
                Logger_1.default.info(`Deleted ${result.deletedCount} documents from ${collectionName}`);
            }
            else {
                Logger_1.default.info(`No matching documents found for ${userId} in ${collectionName}`);
            }
        }
    }
    catch (error) {
        Logger_1.default.error(`Error deleting documents: ${error}`);
    }
}
exports.deleteDocumentsByUserId = deleteDocumentsByUserId;
//# sourceMappingURL=index.js.map