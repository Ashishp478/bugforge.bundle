import type { Request, Response } from 'express';
import { ProjectModel } from '../models/project.js';
import { TaskModel } from '../models/task.js';
import { ActivityLogModel } from '../models/activity-log.js';
import { respond } from '../utils/api.js';
export const dashboard = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projects = await ProjectModel.find({
    $or: [{ owner: userId }, { members: userId }],
    archivedAt: null,
  })
    .sort({ updatedAt: -1 })
    .limit(6);

  // Use _id (ObjectId) not .id (string) — aggregation $in does not auto-cast strings to ObjectId
  const projectIds = projects.map((project) => project._id);

  const [taskCounts, assignedTasks, activity] = await Promise.all([
    // Count completed tasks per project in one aggregation round-trip
    TaskModel.aggregate([
      { $match: { project: { $in: projectIds }, status: 'done' } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
    ]),
    // Active (non-done) tasks assigned to current user
    TaskModel.find({ assignee: userId, status: { $ne: 'done' } })
      .populate('project', 'name key')
      .sort({ dueDate: 1 })
      .limit(8),
    ActivityLogModel.find({ project: { $in: projectIds } })
      .populate('actor', 'name avatarUrl')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const completedTasks = (taskCounts as { count: number }[]).reduce(
    (total, t) => total + t.count,
    0,
  );

  return respond(res, 200, 'Dashboard retrieved', {
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
