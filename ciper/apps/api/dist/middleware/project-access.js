"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTaskAccess = exports.requireProjectAccess = void 0;
const project_js_1 = require("../models/project.js");
const task_js_1 = require("../models/task.js");
const api_js_1 = require("../utils/api.js");
const canAccessProject = async (projectId, userId, role) => {
    if (role === 'admin')
        return project_js_1.ProjectModel.exists({ _id: projectId });
    return project_js_1.ProjectModel.exists({ _id: projectId, $or: [{ owner: userId }, { members: userId }] });
};
const requireProjectAccess = async (req, res, next) => {
    const permitted = await canAccessProject(String(req.params.projectId), req.user.id, req.user.role);
    return permitted ? next() : (0, api_js_1.respond)(res, 404, 'Project not found');
};
exports.requireProjectAccess = requireProjectAccess;
const requireTaskAccess = async (req, res, next) => {
    const task = await task_js_1.TaskModel.findById(req.params.taskId).select('project');
    if (!task)
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    const permitted = await canAccessProject(task.project.toString(), req.user.id, req.user.role);
    return permitted ? next() : (0, api_js_1.respond)(res, 404, 'Task not found');
};
exports.requireTaskAccess = requireTaskAccess;
