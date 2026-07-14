"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
const connectDatabase = () => mongoose_1.default.connect(env_js_1.env.MONGO_URI);
exports.connectDatabase = connectDatabase;
