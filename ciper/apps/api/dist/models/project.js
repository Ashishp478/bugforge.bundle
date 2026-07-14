"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    archivedAt: Date,
}, { timestamps: true });
projectSchema.index({ key: 1 }, { unique: true });
projectSchema.index({ owner: 1, archivedAt: 1 });
projectSchema.index({ members: 1 });
exports.ProjectModel = (0, mongoose_1.model)('Project', projectSchema);
