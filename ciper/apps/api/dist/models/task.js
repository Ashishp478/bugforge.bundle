"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    project: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['backlog', 'todo', 'in_progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    labels: [{ type: String, trim: true }],
    dueDate: Date,
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
taskSchema.index({ project: 1, status: 1, updatedAt: -1 });
exports.TaskModel = (0, mongoose_1.model)('Task', taskSchema);
