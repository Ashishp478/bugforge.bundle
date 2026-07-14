"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordActivity = void 0;
const activity_log_js_1 = require("../models/activity-log.js");
const recordActivity = (actor, action, options = {}) => activity_log_js_1.ActivityLogModel.create({ actor, action, ...options });
exports.recordActivity = recordActivity;
