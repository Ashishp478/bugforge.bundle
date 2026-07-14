"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
const project_js_1 = require("../models/project.js");
const task_js_1 = require("../models/task.js");
const activity_log_js_1 = require("../models/activity-log.js");
const api_js_1 = require("../utils/api.js");
const dashboard = async (req, res) => {
    const userId = req.user.id;
    const projects = await project_js_1.ProjectModel.find({
        $or: [{ owner: userId }, { members: userId }],
        archivedAt: null,
    })
        .sort({ updatedAt: -1 })
        .limit(6);
    // Use _id (ObjectId) not .id (string) — aggregation $in does not auto-cast strings to ObjectId
    const projectIds = projects.map((project) => project._id);
    const [taskCounts, assignedTasks, activity] = await Promise.all([
        // Count completed tasks per project in one aggregation round-trip
        task_js_1.TaskModel.aggregate([
            { $match: { project: { $in: projectIds }, status: 'done' } },
            { $group: { _id: '$project', count: { $sum: 1 } } },
        ]),
        // Active (non-done) tasks assigned to current user
        task_js_1.TaskModel.find({ assignee: userId, status: { $ne: 'done' } })
            .populate('project', 'name key')
            .sort({ dueDate: 1 })
            .limit(8),
        activity_log_js_1.ActivityLogModel.find({ project: { $in: projectIds } })
            .populate('actor', 'name avatarUrl')
            .populate('project', 'name key')
            .sort({ createdAt: -1 })
            .limit(10),
    ]);
    const completedTasks = taskCounts.reduce((total, t) => total + t.count, 0);
    return (0, api_js_1.respond)(res, 200, 'Dashboard retrieved', {
        statistics: {
            projects: projects.length,
            assignedTasks: assignedTasks.length,
            completedTasks,
        },
        projects,
        assignedTasks,
        activity,
    });
};
exports.dashboard = dashboard;
