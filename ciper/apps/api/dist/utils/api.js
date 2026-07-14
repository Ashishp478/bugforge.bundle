"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respond = void 0;
const respond = (res, status, message, data) => res.status(status).json({ success: status < 400, message, data });
exports.respond = respond;
