"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    recipient: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['assignment', 'comment', 'project'], required: true },
    readAt: Date,
    resourceUrl: String,
}, { timestamps: true });
notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });
exports.NotificationModel = (0, mongoose_1.model)('Notification', notificationSchema);
