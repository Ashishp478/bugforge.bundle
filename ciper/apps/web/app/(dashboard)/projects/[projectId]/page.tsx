'use client';
import { use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderKanban, Trash2, CheckCircle2, Clock, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import type { Project, Task, TaskStatus } from '@/types';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

type FormValues = z.infer<typeof schema>;

export default function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const client = useQueryClient();

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api<Project>(`/projects/${projectId}`),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => api<Task[]>(`/projects/${projectId}/tasks`),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      status: 'todo',
      priority: 'medium',
    },
  });

  const createTask = async (values: FormValues) => {
    try {
      await api(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      form.reset();
      await client.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    } catch {
      form.setError('root', { message: 'Unable to create task' });
    }
  };

  const updateStatus = async (taskId: string, nextStatus: TaskStatus) => {
    try {
      await api(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      await client.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api(`/tasks/${taskId}`, { method: 'DELETE' });
      await client.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  if (loadingProject || loadingTasks) {
    return <p className="text-sm text-slate-500">Loading project details…</p>;
  }

  if (!project) {
    return <p className="text-sm text-red-500">Project not found.</p>;
  }

  const columns: { label: string; status: TaskStatus; icon: typeof Clock }[] = [
    { label: 'To Do', status: 'todo', icon: Clock },
    { label: 'In Progress', status: 'in_progress', icon: Play },
    { label: 'Done', status: 'done', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
            {project.key}
          </span>
          <h1 className="text-3xl font-semibold">{project.name}</h1>
        </div>
        <p className="mt-2 text-slate-500">{project.description || 'No description provided.'}</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Create new task</h2>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={form.handleSubmit(createTask)}>
          <Input placeholder="Task title" {...form.register('title')} />

          <select
            className="flex h-10 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-primary border-slate-200 dark:border-slate-800"
            {...form.register('status')}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            className="flex h-10 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-primary border-slate-200 dark:border-slate-800"
            {...form.register('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <Button>Create task</Button>
        </form>
        {form.formState.errors.root && (
          <p className="mt-2 text-sm text-red-600">{form.formState.errors.root.message}</p>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {columns.map(({ label, status, icon: Icon }) => {
          const colTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Icon size={18} className="text-primary" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  {label} ({colTasks.length})
                </h3>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => (
                  <Card
                    key={task._id}
                    className="p-4 space-y-3 shadow-sm border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                      <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-primary">
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 mt-2">
                      <div className="flex gap-1.5">
                        {status !== 'todo' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateStatus(task._id, 'todo')}
                            className="px-2 h-7 text-xs"
                          >
                            To Do
                          </Button>
                        )}
                        {status !== 'in_progress' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateStatus(task._id, 'in_progress')}
                            className="px-2 h-7 text-xs"
                          >
                            Work
                          </Button>
                        )}
                        {status !== 'done' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateStatus(task._id, 'done')}
                            className="px-2 h-7 text-xs"
                          >
                            Done
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTask(task._id)}
                        className="p-1 h-7 w-7 flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-4">
                    No tasks in this column
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
