"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const notification_js_1 = require("../models/notification.js");
const notify = (recipient, type, message, resourceUrl) => notification_js_1.NotificationModel.create({ recipient, type, message, resourceUrl });
exports.notify = notify;
