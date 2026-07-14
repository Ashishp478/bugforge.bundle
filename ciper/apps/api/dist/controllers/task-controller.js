"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTask = exports.createTask = exports.listTasks = void 0;
const task_js_1 = require("../models/task.js");
const project_js_1 = require("../models/project.js");
const schemas_js_1 = require("../validators/schemas.js");
const api_js_1 = require("../utils/api.js");
const activity_service_js_1 = require("../services/activity-service.js");
const notification_service_js_1 = require("../services/notification-service.js");
const availableProject = (projectId, userId) => project_js_1.ProjectModel.exists({ _id: projectId, $or: [{ owner: userId }, { members: userId }] });
const listTasks = async (req, res) => {
    const projectId = String(req.params.projectId);
    if (!(await availableProject(projectId, req.user.id)))
        return (0, api_js_1.respond)(res, 404, 'Project not found');
    const { status, assignee } = req.query;
    const filter = { project: projectId };
    if (typeof status === 'string')
        filter.status = status;
    if (typeof assignee === 'string')
        filter.assignee = assignee;
    return (0, api_js_1.respond)(res, 200, 'Tasks retrieved', await task_js_1.TaskModel.find(filter)
        .populate('assignee createdBy', 'name email avatarUrl')
        .sort({ updatedAt: -1 }));
};
exports.listTasks = listTasks;
const createTask = async (req, res) => {
    const projectId = String(req.params.projectId);
    if (!(await availableProject(projectId, req.user.id)))
        return (0, api_js_1.respond)(res, 404, 'Project not found');
    const values = schemas_js_1.taskSchema.parse(req.body);
    const task = await task_js_1.TaskModel.create({ ...values, project: projectId, createdBy: req.user.id });
    await (0, activity_service_js_1.recordActivity)(req.user.id, 'task.created', { project: projectId, task: task.id });
    if (task.assignee && task.assignee.toString() !== req.user.id)
        await (0, notification_service_js_1.notify)(task.assignee.toString(), 'assignment', `You were assigned "${task.title}"`, `/tasks/${task.id}`);
    return (0, api_js_1.respond)(res, 201, 'Task created', task);
};
exports.createTask = createTask;
const getTask = async (req, res) => {
    const task = await task_js_1.TaskModel.findById(req.params.taskId).populate('assignee createdBy', 'name email avatarUrl');
    if (!task)
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    if (!(await availableProject(task.project.toString(), req.user.id)))
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    return (0, api_js_1.respond)(res, 200, 'Task retrieved', task);
};
exports.getTask = getTask;
const updateTask = async (req, res) => {
    const existing = await task_js_1.TaskModel.findById(req.params.taskId);
    if (!existing)
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    if (!(await availableProject(existing.project.toString(), req.user.id)))
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    const values = schemas_js_1.taskSchema.partial().parse(req.body);
    const task = await task_js_1.TaskModel.findByIdAndUpdate(req.params.taskId, values, {
        new: true,
        runValidators: true,
    });
    if (!task)
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    await (0, activity_service_js_1.recordActivity)(req.user.id, 'task.updated', {
        project: task.project.toString(),
        task: task.id,
        metadata: { fields: Object.keys(values) },
    });
    if (typeof values.assignee === 'string' && values.assignee !== req.user.id)
        await (0, notification_service_js_1.notify)(values.assignee, 'assignment', `You were assigned "${task.title}"`, `/tasks/${task.id}`);
    return (0, api_js_1.respond)(res, 200, 'Task updated', task);
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    const existing = await task_js_1.TaskModel.findById(req.params.taskId);
    if (!existing)
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    if (!(await availableProject(existing.project.toString(), req.user.id)))
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    const task = await task_js_1.TaskModel.findByIdAndDelete(req.params.taskId);
    if (task)
        await (0, activity_service_js_1.recordActivity)(req.user.id, 'task.deleted', {
            project: task.project.toString(),
            task: task.id,
        });
    return task ? (0, api_js_1.respond)(res, 200, 'Task deleted') : (0, api_js_1.respond)(res, 404, 'Task not found');
};
exports.deleteTask = deleteTask;
