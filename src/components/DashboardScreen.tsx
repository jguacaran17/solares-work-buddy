import { mockWorkers, mockTasks } from "@/lib/mock-data";
import { Users, ListChecks, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const statusColors: Record<string, string> = {
  working: 'bg-success text-success-foreground',
  break: 'bg-warning text-warning-foreground',
  off: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  working: 'Trabajando',
  break: 'Descanso',
  off: 'Finalizado',
};

const priorityColors: Record<string, string> = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-success',
};

const taskStatusLabels: Record<string, string> = {
  'pending': 'Pendiente',
  'in-progress': 'En curso',
  'done': 'Completada',
};

const DashboardScreen = () => {
  const activeWorkers = mockWorkers.filter((w) => w.status !== 'off').length;
  const pendingTasks = mockTasks.filter((t) => t.status !== 'done').length;
  const totalHours = mockWorkers.reduce((sum, w) => sum + w.hoursToday, 0);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          5 Abril 2026 — Planta Solar Almería
        </p>
        <h2 className="text-xl font-bold mt-1">Panel del Capataz</h2>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Users, label: 'Activos', value: activeWorkers, color: 'text-success' },
          { icon: ListChecks, label: 'Tareas', value: pendingTasks, color: 'text-warning' },
          { icon: Clock, label: 'Horas', value: totalHours.toFixed(1), color: 'text-info' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Workers section */}
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" /> Operarios hoy
      </h3>
      <div className="space-y-2 mb-6">
        {mockWorkers.map((worker) => (
          <div key={worker.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {worker.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{worker.name}</p>
              <p className="text-xs text-muted-foreground">{worker.role}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold">{worker.hoursToday}h</p>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[worker.status]}`}>
                {statusLabels[worker.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks section */}
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <ListChecks className="w-4 h-4" /> Tareas del día
      </h3>
      <div className="space-y-2">
        {mockTasks.map((task) => (
          <div
            key={task.id}
            className={`glass-card rounded-xl p-3 border-l-4 ${priorityColors[task.priority]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.zone}</p>
              </div>
              <Badge
                variant={task.status === 'done' ? 'default' : 'secondary'}
                className="text-[10px] shrink-0"
              >
                {taskStatusLabels[task.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {task.assignedTo.map((wId) => {
                const w = mockWorkers.find((w) => w.id === wId);
                return w ? (
                  <span
                    key={wId}
                    className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-[9px] font-bold flex items-center justify-center"
                  >
                    {w.avatar}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardScreen;
