"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const error_js_1 = require("./middleware/error.js");
const env_js_1 = require("./config/env.js");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, pino_http_1.default)());
    app.use((0, cors_1.default)({ origin: env_js_1.env.CORS_ORIGIN, credentials: true }));
    app.use(express_1.default.json({ limit: '1mb' }));
    app.get('/health', (_req, res) => res.json({ success: true, message: 'Healthy', data: { status: 'ok' } }));
    const swagger = (0, swagger_jsdoc_1.default)({
        definition: {
            openapi: '3.0.0',
            info: { title: 'BugForge API', version: '1.0.0' },
            components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
        },
        apis: ['./src/routes/*.ts'],
    });
    app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger));
    app.use('/api/v1', index_js_1.default);
    app.use(error_js_1.notFound);
    app.use(error_js_1.errorHandler);
    return app;
};
exports.createApp = createApp;
