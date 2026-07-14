'use client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';
import type { Task, TaskStatus, Priority } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';

// ── colour palettes ──────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  backlog: '#6366f1',
  todo: '#f59e0b',
  in_progress: '#3b82f6',
  done: '#22c55e',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high', 'urgent'];
const STATUS_ORDER: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'done'];

// ── helpers ──────────────────────────────────────────────────────────────────
function countBy<T extends string>(items: string[], keys: T[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  keys.forEach((k) => (counts[k] = 0));
  items.forEach((item) => {
    if (item in counts) counts[item]++;
  });
  return keys.map((k) => ({ name: k.replace('_', ' '), value: counts[k] }));
}

// ── custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 text-sm shadow-lg">
        <p className="capitalize font-semibold">{label}</p>
        <p className="text-primary">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

// ── page ──────────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () =>
      api<{
        tasks: Task[];
        statistics: { assignedTasks: number; completedTasks: number };
      }>('/tasks/mine'),
  });

  const tasks = data?.tasks ?? [];
  const stats = data?.statistics ?? { assignedTasks: 0, completedTasks: 0 };

  // Compute chart data
  const statusData = countBy(
    tasks.map((t) => t.status),
    STATUS_ORDER,
  );
  const priorityData = countBy(
    tasks.map((t) => t.priority),
    PRIORITY_ORDER,
  );

  // Histogram: tasks grouped by priority × status (stacked bar)
  const histogramData = PRIORITY_ORDER.map((priority) => {
    const filtered = tasks.filter((t) => t.priority === priority);
    return {
      name: priority,
      backlog: filtered.filter((t) => t.status === 'backlog').length,
      todo: filtered.filter((t) => t.status === 'todo').length,
      in_progress: filtered.filter((t) => t.status === 'in_progress').length,
      done: filtered.filter((t) => t.status === 'done').length,
    };
  });

  return (
    <div className="space-y-8">
      {/* ── header ── */}
      <div>
        <p className="text-sm font-medium text-primary">Your queue</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">My tasks</h1>
        <p className="mt-1 text-slate-500">Analytics and overview of all tasks assigned to you.</p>
      </div>

      {/* ── stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total assigned', value: stats.assignedTasks, color: 'text-blue-500' },
          { label: 'Completed', value: stats.completedTasks, color: 'text-green-500' },
          {
            label: 'Completion rate',
            value:
              stats.assignedTasks > 0
                ? `${Math.round((stats.completedTasks / stats.assignedTasks) * 100)}%`
                : '0%',
            color: 'text-purple-500',
          },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-1 text-4xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* ── charts row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart – tasks by status */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Tasks by status</h2>
          {isLoading ? (
            <div className="h-48 animate-pulse rounded bg-muted" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name.replace(' ', '_')] ?? '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie chart – tasks by priority */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Tasks by priority</h2>
          {isLoading ? (
            <div className="h-48 animate-pulse rounded bg-muted" />
          ) : tasks.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-slate-400 text-sm">
              No tasks assigned yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={priorityData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData
                    .filter((d) => d.value > 0)
                    .map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#6366f1'} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`]} />
                <Legend
                  formatter={(value) => <span className="capitalize text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── histogram – priority × status ── */}
      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Task distribution — Priority × Status (Histogram)</h2>
        {isLoading ? (
          <div className="h-56 animate-pulse rounded bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={histogramData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  `${String(value)} tasks`,
                  String(name).replace('_', ' '),
                ]}
              />
              <Legend formatter={(value) => value.replace('_', ' ')} />
              {STATUS_ORDER.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="a"
                  fill={STATUS_COLORS[status]}
                  radius={status === 'done' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── task list ── */}
      <div>
        <h2 className="mb-3 font-semibold text-lg">Active task queue</h2>
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task._id}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? '#6366f1' }}
                />
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">
                    {task.status.replace('_', ' ')} · {task.priority}
                    {task.dueDate && (
                      <span className="ml-2 text-amber-500">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `${STATUS_COLORS[task.status]}20`,
                  color: STATUS_COLORS[task.status],
                }}
              >
                {task.project?.key ?? '—'}
              </span>
            </Card>
          ))}
          {tasks.length === 0 && !isLoading && (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-slate-400">Your task list is clear. 🎉</p>
              <p className="mt-1 text-sm text-slate-500">
                Create a project and add tasks to see them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
