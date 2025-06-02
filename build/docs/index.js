"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const configVars_1 = require("../configVars");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chichkhan API',
            version: '1.0.0',
            description: 'Chichkhan backend API routes',
        },
        servers: [
            {
                url: configVars_1.baseUrl,
                description: 'Development',
            },
        ],
    },
    apis: ['./src/docs/**/*.ts', './src/docs/*.ts'],
    swaggerOptions: {
        docExpansion: 'none', // Collapse all operations by default
    },
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=index.js.map