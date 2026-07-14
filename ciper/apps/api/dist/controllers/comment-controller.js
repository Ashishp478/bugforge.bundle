"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.createComment = exports.listComments = void 0;
const comment_js_1 = require("../models/comment.js");
const task_js_1 = require("../models/task.js");
const schemas_js_1 = require("../validators/schemas.js");
const api_js_1 = require("../utils/api.js");
const activity_service_js_1 = require("../services/activity-service.js");
const notification_service_js_1 = require("../services/notification-service.js");
const listComments = async (req, res) => (0, api_js_1.respond)(res, 200, 'Comments retrieved', await comment_js_1.CommentModel.find({ task: req.params.taskId })
    .populate('author', 'name email avatarUrl')
    .sort({ createdAt: 1 }));
exports.listComments = listComments;
const createComment = async (req, res) => {
    const task = await task_js_1.TaskModel.findById(req.params.taskId);
    if (!task)
        return (0, api_js_1.respond)(res, 404, 'Task not found');
    const comment = await comment_js_1.CommentModel.create({
        ...schemas_js_1.commentSchema.parse(req.body),
        task: task.id,
        author: req.user.id,
    });
    await (0, activity_service_js_1.recordActivity)(req.user.id, 'comment.created', {
        project: task.project.toString(),
        task: task.id,
    });
    if (task.assignee && task.assignee.toString() !== req.user.id)
        await (0, notification_service_js_1.notify)(task.assignee.toString(), 'comment', `New comment on “${task.title}”`, `/tasks/${task.id}`);
    return (0, api_js_1.respond)(res, 201, 'Comment added', await comment.populate('author', 'name email avatarUrl'));
};
exports.createComment = createComment;
const updateComment = async (req, res) => {
    const comment = await comment_js_1.CommentModel.findOneAndUpdate({ _id: req.params.commentId, author: req.user.id }, schemas_js_1.commentSchema.parse(req.body), { new: true });
    if (comment) {
        const task = await task_js_1.TaskModel.findById(comment.task).select('project');
        if (task)
            await (0, activity_service_js_1.recordActivity)(req.user.id, 'comment.updated', {
                project: task.project.toString(),
                task: task.id,
            });
    }
    return comment
        ? (0, api_js_1.respond)(res, 200, 'Comment updated', comment)
        : (0, api_js_1.respond)(res, 404, 'Comment not found');
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    const comment = await comment_js_1.CommentModel.findOneAndDelete({
        _id: req.params.commentId,
        author: req.user.id,
    });
    if (comment) {
        const task = await task_js_1.TaskModel.findById(comment.task).select('project');
        if (task)
            await (0, activity_service_js_1.recordActivity)(req.user.id, 'comment.deleted', {
                project: task.project.toString(),
                task: task.id,
            });
    }
    return comment ? (0, api_js_1.respond)(res, 200, 'Comment deleted') : (0, api_js_1.respond)(res, 404, 'Comment not found');
};
exports.deleteComment = deleteComment;
