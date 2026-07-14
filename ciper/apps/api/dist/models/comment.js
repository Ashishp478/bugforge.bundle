"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    task: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
}, { timestamps: true });
exports.CommentModel = (0, mongoose_1.model)('Comment', commentSchema);
