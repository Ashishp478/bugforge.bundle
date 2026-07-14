"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = exports.taskSchema = exports.projectSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(80),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
});
exports.loginSchema = exports.registerSchema.pick({ email: true, password: true });
exports.projectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(120),
    key: zod_1.z.string().regex(/^[A-Za-z][A-Za-z0-9]{1,9}$/),
    description: zod_1.z.string().max(2000).optional(),
    members: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(180),
    description: zod_1.z.string().max(10000).optional(),
    status: zod_1.z.enum(['backlog', 'todo', 'in_progress', 'done']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assignee: zod_1.z.string().nullable().optional(),
    labels: zod_1.z.array(zod_1.z.string().min(1).max(30)).max(10).optional(),
    dueDate: zod_1.z.coerce.date().nullable().optional(),
});
exports.commentSchema = zod_1.z.object({ body: zod_1.z.string().min(1).max(5000) });
