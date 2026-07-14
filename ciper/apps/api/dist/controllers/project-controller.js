"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveProject = exports.deleteProject = exports.updateProject = exports.getProject = exports.createProject = exports.listProjects = void 0;
const project_js_1 = require("../models/project.js");
const schemas_js_1 = require("../validators/schemas.js");
const api_js_1 = require("../utils/api.js");
const activity_service_js_1 = require("../services/activity-service.js");
const listProjects = async (req, res) => (0, api_js_1.respond)(res, 200, 'Projects retrieved', await project_js_1.ProjectModel.find({
    $or: [{ owner: req.user.id }, { members: req.user.id }],
    archivedAt: null,
})
    .populate('owner members', 'name email avatarUrl')
    .sort({ updatedAt: -1 }));
exports.listProjects = listProjects;
const createProject = async (req, res) => {
    const values = schemas_js_1.projectSchema.parse(req.body);
    const project = await project_js_1.ProjectModel.create({
        ...values,
        owner: req.user.id,
        members: [...new Set([req.user.id, ...(values.members ?? [])])],
    });
    await (0, activity_service_js_1.recordActivity)(req.user.id, 'project.created', { project: project.id });
    return (0, api_js_1.respond)(res, 201, 'Project created', project);
};
exports.createProject = createProject;
const getProject = async (req, res) => {
    const project = await project_js_1.ProjectModel.findById(req.params.projectId).populate('owner members', 'name email avatarUrl');
    return project
        ? (0, api_js_1.respond)(res, 200, 'Project retrieved', project)
        : (0, api_js_1.respond)(res, 404, 'Project not found');
};
exports.getProject = getProject;
const updateProject = async (req, res) => {
    const project = await project_js_1.ProjectModel.findOneAndUpdate({ _id: req.params.projectId, owner: req.user.id }, schemas_js_1.projectSchema.partial().parse(req.body), { new: true, runValidators: true });
    if (project)
        await (0, activity_service_js_1.recordActivity)(req.user.id, 'project.updated', { project: project.id });
    return project
        ? (0, api_js_1.respond)(res, 200, 'Project updated', project)
        : (0, api_js_1.respond)(res, 404, 'Project not found');
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    const project = await project_js_1.ProjectModel.findOneAndDelete({
        _id: req.params.projectId,
        owner: req.user.id,
    });
    if (project)
        await (0, activity_service_js_1.recordActivity)(req.user.id, 'project.deleted', { project: project.id });
    return project ? (0, api_js_1.respond)(res, 200, 'Project deleted') : (0, api_js_1.respond)(res, 404, 'Project not found');
};
exports.deleteProject = deleteProject;
const archiveProject = async (req, res) => {
    const project = await project_js_1.ProjectModel.findOneAndUpdate({ _id: req.params.projectId, owner: req.user.id }, { archivedAt: new Date() }, { new: true });
    if (project)
        await (0, activity_service_js_1.recordActivity)(req.user.id, 'project.archived', { project: project.id });
    return project
        ? (0, api_js_1.respond)(res, 200, 'Project archived', project)
        : (0, api_js_1.respond)(res, 404, 'Project not found');
};
exports.archiveProject = archiveProject;
