"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("./core/Logger"));
const configVars_1 = require("./configVars");
const app_1 = __importDefault(require("./app"));
app_1.default
    .listen(configVars_1.port, () => {
    Logger_1.default.info(`server running on port : ${configVars_1.port} 👌`);
})
    .on('error', (e) => {
    console.log(e);
    // Logger.error(e);
});
//# sourceMappingURL=server.js.map