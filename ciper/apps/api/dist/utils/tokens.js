"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const tokenOptions = (expiresIn) => ({
    expiresIn: expiresIn,
});
const createAccessToken = (userId) => jsonwebtoken_1.default.sign({ sub: userId }, env_js_1.env.JWT_ACCESS_SECRET, tokenOptions(env_js_1.env.ACCESS_TOKEN_TTL));
exports.createAccessToken = createAccessToken;
const createRefreshToken = (userId) => jsonwebtoken_1.default.sign({ sub: userId }, env_js_1.env.JWT_REFRESH_SECRET, tokenOptions(env_js_1.env.REFRESH_TOKEN_TTL));
exports.createRefreshToken = createRefreshToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_ACCESS_SECRET);
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_REFRESH_SECRET);
exports.verifyRefreshToken = verifyRefreshToken;
