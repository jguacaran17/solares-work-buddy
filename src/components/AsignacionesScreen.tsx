import { useState } from "react";
import { mockActivities, Worker } from "@/lib/mock-data";
import { ChevronRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  activity: string;
  workerIds: string[];
}

interface AsignacionesScreenProps {
  workers: Worker[];
  assignments: Assignment[];
  onUpdateAssignments: (a: Assignment[]) => void;
  onNext: () => void;
}

const AsignacionesScreen = ({ workers, assignments, onUpdateAssignments, onNext }: AsignacionesScreenProps) => {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const presentWorkers = workers.filter(w => w.status === 'presente');
  const assignedIds = new Set(assignments.flatMap(a => a.workerIds));
  const unassignedWorkers = presentWorkers.filter(w => !assignedIds.has(w.id));
  const totalAssigned = assignedIds.size;
  const progress = presentWorkers.length > 0 ? Math.round((totalAssigned / presentWorkers.length) * 100) : 0;

  const toggleWorkerInActivity = (activity: string, workerId: string) => {
    const existing = assignments.find(a => a.activity === activity);
    let updated: Assignment[];

    if (existing) {
      const hasWorker = existing.workerIds.includes(workerId);
      updated = assignments.map(a =>
        a.activity === activity
          ? {
              ...a,
              workerIds: hasWorker
                ? a.workerIds.filter(id => id !== workerId)
                : [...a.workerIds, workerId],
            }
          : a
      );
    } else {
      updated = [...assignments, { activity, workerIds: [workerId] }];
    }

    // Remove from other activities
    updated = updated.map(a =>
      a.activity !== activity
        ? { ...a, workerIds: a.workerIds.filter(id => id !== workerId) }
        : a
    );

    onUpdateAssignments(updated.filter(a => a.workerIds.length > 0));
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="stat-card">
          <p className="text-lg font-bold text-success">{presentWorkers.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Fichados</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold text-primary">{totalAssigned}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Asignados</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold text-warning">{unassignedWorkers.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Sin asignar</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">Progreso asignación</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <p className="text-xs text-muted-foreground mb-3">Asigna operarios por actividad</p>

      {/* Activities */}
      <div className="glass-card rounded-xl overflow-hidden mb-4">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold">Actividades del día</span>
          <span className="text-[10px] text-muted-foreground">{totalAssigned} asignados</span>
        </div>
        <div className="divide-y divide-border">
          {mockActivities.map(activity => {
            const assigned = assignments.find(a => a.activity === activity);
            const count = assigned?.workerIds.length || 0;
            const isExpanded = expandedActivity === activity;

            return (
              <div key={activity}>
                <button
                  onClick={() => setExpandedActivity(isExpanded ? null : activity)}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{activity}</span>
                    {count > 0 && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-1">
                    {presentWorkers.map(worker => {
                      const isAssigned = assigned?.workerIds.includes(worker.id) || false;
                      return (
                        <button
                          key={worker.id}
                          onClick={() => toggleWorkerInActivity(activity, worker.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                            isAssigned
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">
                            {worker.avatar}
                          </div>
                          {worker.name}
                          {isAssigned && <span className="ml-auto text-primary text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unassigned */}
      <p className="text-xs font-semibold mb-2">Operarios sin asignar</p>
      <div className="glass-card rounded-xl p-3 mb-4">
        {unassignedWorkers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">Todos asignados ✓</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unassignedWorkers.map(w => (
              <span
                key={w.id}
                className="inline-flex items-center gap-1 bg-warning/10 text-warning text-xs font-medium px-2 py-1 rounded-full"
              >
                {w.avatar} {w.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button className="w-full" onClick={onNext}>
        Confirmar → Revisar horas
      </Button>
    </div>
  );
};

export default AsignacionesScreen;