"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const configVars_1 = require("./configVars");
require("./database"); // initialize database
const ApiError_1 = require("./core/ApiError");
const routes_1 = __importDefault(require("./routes"));
const docs_1 = require("./docs");
process.on('uncaughtException', (e) => {
    // Logger.error(e);
    console.log(e);
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: configVars_1.corsUrl, optionsSuccessStatus: 200, credentials: true }));
if (configVars_1.environment === 'development') {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(docs_1.specs));
}
// Routes
app.use('/api', routes_1.default);
app.use(express_1.default.static('media'));
app.use('/public', express_1.default.static('public'));
// catch 404 and forward to error handler
app.use((req, res, next) => next(new ApiError_1.NotFoundError()));
// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    if (err instanceof ApiError_1.ApiError) {
        ApiError_1.ApiError.handle(err, res);
    }
    else {
        if (configVars_1.environment === 'development') {
            // Logger.error(err);
            console.log(err.message);
            return res.status(500).send({ status: 'fail', message: err.message });
        }
        ApiError_1.ApiError.handle(new ApiError_1.InternalError(), res);
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map