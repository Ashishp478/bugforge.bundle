"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const schema = zod_1.z.object({
    MONGO_URI: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    ACCESS_TOKEN_TTL: zod_1.z.string().default('15m'),
    REFRESH_TOKEN_TTL: zod_1.z.string().default('7d'),
    API_PORT: zod_1.z.coerce.number().default(4000),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
});
exports.env = schema.parse(process.env);
