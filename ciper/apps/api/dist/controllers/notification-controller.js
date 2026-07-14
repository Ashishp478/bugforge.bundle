"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readNotification = exports.listNotifications = void 0;
const notification_js_1 = require("../models/notification.js");
const api_js_1 = require("../utils/api.js");
const listNotifications = async (req, res) => (0, api_js_1.respond)(res, 200, 'Notifications retrieved', await notification_js_1.NotificationModel.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(30));
exports.listNotifications = listNotifications;
const readNotification = async (req, res) => {
    const notification = await notification_js_1.NotificationModel.findOneAndUpdate({ _id: req.params.notificationId, recipient: req.user.id }, { readAt: new Date() }, { new: true });
    return notification
        ? (0, api_js_1.respond)(res, 200, 'Notification marked as read', notification)
        : (0, api_js_1.respond)(res, 404, 'Notification not found');
};
exports.readNotification = readNotification;
