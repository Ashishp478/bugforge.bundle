"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_js_1 = require("../middleware/auth.js");
const project_access_js_1 = require("../middleware/project-access.js");
const auth = __importStar(require("../controllers/auth-controller.js"));
const projects = __importStar(require("../controllers/project-controller.js"));
const tasks = __importStar(require("../controllers/task-controller.js"));
const comments = __importStar(require("../controllers/comment-controller.js"));
const dashboard = __importStar(require("../controllers/dashboard-controller.js"));
const notifications = __importStar(require("../controllers/notification-controller.js"));
const async_handler_js_1 = require("../utils/async-handler.js");
const router = (0, express_1.Router)();
const protect = (handler) => [
    auth_js_1.requireAuth,
    (0, async_handler_js_1.asyncHandler)(handler),
];
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { success: false, message: 'Too many authentication attempts, please try again later' }
});
router.post('/auth/register', authLimiter, (0, async_handler_js_1.asyncHandler)(auth.register));
router.post('/auth/login', authLimiter, (0, async_handler_js_1.asyncHandler)(auth.login));
router.post('/auth/refresh', authLimiter, (0, async_handler_js_1.asyncHandler)(auth.refresh));
router.post('/auth/forgot-password', authLimiter, (0, async_handler_js_1.asyncHandler)(auth.forgotPassword));
router.post('/auth/logout', ...protect(auth.logout));
router.get('/auth/me', ...protect(auth.profile));
router.patch('/auth/me', ...protect(auth.updateProfile));
router.get('/projects', ...protect(projects.listProjects));
router.post('/projects', ...protect(projects.createProject));
router.get('/projects/:projectId', auth_js_1.requireAuth, project_access_js_1.requireProjectAccess, (0, async_handler_js_1.asyncHandler)(projects.getProject));
router.patch('/projects/:projectId', auth_js_1.requireAuth, project_access_js_1.requireProjectAccess, (0, async_handler_js_1.asyncHandler)(projects.updateProject));
router.delete('/projects/:projectId', auth_js_1.requireAuth, project_access_js_1.requireProjectAccess, (0, async_handler_js_1.asyncHandler)(projects.deleteProject));
router.post('/projects/:projectId/archive', auth_js_1.requireAuth, project_access_js_1.requireProjectAccess, (0, async_handler_js_1.asyncHandler)(projects.archiveProject));
router.get('/projects/:projectId/tasks', auth_js_1.requireAuth, project_access_js_1.requireProjectAccess, (0, async_handler_js_1.asyncHandler)(tasks.listTasks));
router.post('/projects/:projectId/tasks', auth_js_1.requireAuth, project_access_js_1.requireProjectAccess, (0, async_handler_js_1.asyncHandler)(tasks.createTask));
router.get('/tasks/:taskId', ...protect(tasks.getTask));
router.patch('/tasks/:taskId', auth_js_1.requireAuth, project_access_js_1.requireTaskAccess, (0, async_handler_js_1.asyncHandler)(tasks.updateTask));
router.delete('/tasks/:taskId', auth_js_1.requireAuth, project_access_js_1.requireTaskAccess, (0, async_handler_js_1.asyncHandler)(tasks.deleteTask));
router.get('/tasks/:taskId/comments', auth_js_1.requireAuth, project_access_js_1.requireTaskAccess, (0, async_handler_js_1.asyncHandler)(comments.listComments));
router.post('/tasks/:taskId/comments', auth_js_1.requireAuth, project_access_js_1.requireTaskAccess, (0, async_handler_js_1.asyncHandler)(comments.createComment));
router.patch('/tasks/:taskId/comments/:commentId', auth_js_1.requireAuth, project_access_js_1.requireTaskAccess, (0, async_handler_js_1.asyncHandler)(comments.updateComment));
router.delete('/tasks/:taskId/comments/:commentId', auth_js_1.requireAuth, project_access_js_1.requireTaskAccess, (0, async_handler_js_1.asyncHandler)(comments.deleteComment));
router.get('/dashboard', ...protect(dashboard.dashboard));
router.get('/notifications', ...protect(notifications.listNotifications));
router.patch('/notifications/:notificationId/read', ...protect(notifications.readNotification));
exports.default = router;
