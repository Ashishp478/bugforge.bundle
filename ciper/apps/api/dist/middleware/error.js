"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const zod_1 = require("zod");
const api_js_1 = require("../utils/api.js");
const notFound = (_req, res) => (0, api_js_1.respond)(res, 404, 'Resource not found');
exports.notFound = notFound;
const errorHandler = (error, _req, res, _next) => {
    void _next;
    if (error instanceof zod_1.ZodError)
        return (0, api_js_1.respond)(res, 422, 'Validation failed', error.flatten());
    if (error.code === 11000)
        return (0, api_js_1.respond)(res, 409, 'A record with that value already exists');
    const status = error.status ?? 500;
    return (0, api_js_1.respond)(res, status, error.message);
};
exports.errorHandler = errorHandler;
