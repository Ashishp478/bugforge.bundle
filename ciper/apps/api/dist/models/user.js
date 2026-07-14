"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesPassword = exports.hashPassword = exports.UserModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    avatarUrl: String,
    refreshToken: { type: String, select: false },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            Reflect.deleteProperty(ret, 'passwordHash');
            Reflect.deleteProperty(ret, 'refreshToken');
            return ret;
        },
    },
});
userSchema.index({ email: 1 }, { unique: true });
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
const hashPassword = (password) => bcrypt_1.default.hash(password, 12);
exports.hashPassword = hashPassword;
const matchesPassword = (password, hash) => bcrypt_1.default.compare(password, hash);
exports.matchesPassword = matchesPassword;
