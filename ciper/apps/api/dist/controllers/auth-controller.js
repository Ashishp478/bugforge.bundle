"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.profile = exports.forgotPassword = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const user_js_1 = require("../models/user.js");
const schemas_js_1 = require("../validators/schemas.js");
const api_js_1 = require("../utils/api.js");
const tokens_js_1 = require("../utils/tokens.js");
const session = async (user) => {
    const accessToken = (0, tokens_js_1.createAccessToken)(user.id);
    const refreshToken = (0, tokens_js_1.createRefreshToken)(user.id);
    user.refreshToken = refreshToken;
    await user.save();
    return { user: user.toJSON(), accessToken, refreshToken };
};
const register = async (req, res) => {
    const input = schemas_js_1.registerSchema.parse(req.body);
    const existing = await user_js_1.UserModel.exists({ email: input.email });
    if (existing)
        return (0, api_js_1.respond)(res, 409, 'Email already in use');
    const user = await user_js_1.UserModel.create({
        ...input,
        passwordHash: await (0, user_js_1.hashPassword)(input.password),
    });
    return (0, api_js_1.respond)(res, 201, 'Account created', await session(user));
};
exports.register = register;
const login = async (req, res) => {
    const input = schemas_js_1.loginSchema.parse(req.body);
    req.log.info({ email: input.email }, 'Login attempt received');
    const user = await user_js_1.UserModel.findOne({ email: input.email }).select('+passwordHash');
    if (!user || !(await (0, user_js_1.matchesPassword)(input.password, String(user.passwordHash))))
        return (0, api_js_1.respond)(res, 401, 'Invalid email or password');
    return (0, api_js_1.respond)(res, 200, 'Signed in', await session(user));
};
exports.login = login;
const refresh = async (req, res) => {
    const token = req.body.refreshToken;
    if (!token)
        return (0, api_js_1.respond)(res, 401, 'Refresh token required');
    try {
        const payload = (0, tokens_js_1.verifyRefreshToken)(token);
        const user = await user_js_1.UserModel.findById(payload.sub).select('+refreshToken');
        if (!user || user.refreshToken !== token)
            return (0, api_js_1.respond)(res, 401, 'Invalid refresh token');
        return (0, api_js_1.respond)(res, 200, 'Token refreshed', { accessToken: (0, tokens_js_1.createAccessToken)(user.id) });
    }
    catch {
        return (0, api_js_1.respond)(res, 401, 'Invalid refresh token');
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    if (req.user) {
        req.user.refreshToken = undefined;
        await req.user.save();
    }
    return (0, api_js_1.respond)(res, 200, 'Signed out');
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    const email = schemas_js_1.loginSchema.shape.email.parse(req.body.email);
    const user = await user_js_1.UserModel.findOne({ email });
    if (user)
        req.log.info({ email }, 'Mock password reset email queued');
    return (0, api_js_1.respond)(res, 200, 'If an account exists, reset instructions have been sent');
};
exports.forgotPassword = forgotPassword;
const profile = async (req, res) => (0, api_js_1.respond)(res, 200, 'Profile retrieved', req.user);
exports.profile = profile;
const updateProfile = async (req, res) => {
    const values = schemas_js_1.registerSchema
        .pick({ name: true })
        .extend({ avatarUrl: zod_1.z.string().url().optional() })
        .parse(req.body);
    Object.assign(req.user, values);
    await req.user.save();
    return (0, api_js_1.respond)(res, 200, 'Profile updated', req.user);
};
exports.updateProfile = updateProfile;
