"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const user_js_1 = require("../models/user.js");
const api_js_1 = require("../utils/api.js");
const tokens_js_1 = require("../utils/tokens.js");
const requireAuth = async (req, res, next) => {
    try {
        const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
        if (!token)
            return (0, api_js_1.respond)(res, 401, 'Authentication required');
        const payload = (0, tokens_js_1.verifyAccessToken)(token);
        const user = await user_js_1.UserModel.findById(payload.sub);
        if (!user)
            return (0, api_js_1.respond)(res, 401, 'Session is no longer valid');
        req.user = user;
        next();
    }
    catch {
        return (0, api_js_1.respond)(res, 401, 'Authentication required');
    }
};
exports.requireAuth = requireAuth;
const requireRole = (...roles) => (req, res, next) => req.user && roles.includes(req.user.role)
    ? next()
    : (0, api_js_1.respond)(res, 403, 'Insufficient permissions');
exports.requireRole = requireRole;
