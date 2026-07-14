"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogModel = void 0;
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    actor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    task: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Task' },
    action: { type: String, required: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
exports.ActivityLogModel = (0, mongoose_1.model)('ActivityLog', activitySchema);
