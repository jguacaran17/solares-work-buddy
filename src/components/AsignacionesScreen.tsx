import { useState } from "react";
import { mockActivities, Worker } from "@/lib/mock-data";
import { ChevronDown, UserPlus, Users } from "lucide-react";
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

  const assignAllToActivity = (activity: string) => {
    const availableIds = presentWorkers.map(w => w.id);
    // Remove all workers from other activities, assign all to this one
    let updated = assignments.map(a =>
      a.activity === activity
        ? { ...a, workerIds: availableIds }
        : { ...a, workerIds: [] }
    ).filter(a => a.workerIds.length > 0);

    const exists = updated.find(a => a.activity === activity);
    if (!exists) {
      updated.push({ activity, workerIds: availableIds });
    }

    onUpdateAssignments(updated);
  };

  const clearActivityWorkers = (activity: string) => {
    onUpdateAssignments(assignments.filter(a => a.activity !== activity));
  };

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
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
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">Progreso asignación</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <p className="text-xs text-muted-foreground mb-3 font-medium">Asigna operarios por actividad</p>

      {/* Activities list */}
      <div className="glass-card rounded-xl overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-bold">Actividades del día</span>
          <span className="text-[11px] text-muted-foreground">{totalAssigned} asignados</span>
        </div>

        {mockActivities.map((activity, idx) => {
          const assigned = assignments.find(a => a.activity === activity);
          const count = assigned?.workerIds.length || 0;
          const isExpanded = expandedActivity === activity;

          return (
            <div key={activity} className={idx > 0 ? 'border-t border-border/40' : ''}>
              <button
                onClick={() => setExpandedActivity(isExpanded ? null : activity)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left active:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{activity}</span>
                  {count > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {count}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded worker list */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-4">
                  {/* Assign all / Clear buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => assignAllToActivity(activity)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" /> Asignar todos
                    </button>
                    {count > 0 && (
                      <button
                        onClick={() => clearActivityWorkers(activity)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 px-3 py-2 rounded-lg hover:bg-destructive/20 transition-colors"
                      >
                        Quitar todos
                      </button>
                    )}
                  </div>

                  {/* Workers grid */}
                  <div className="space-y-1.5">
                    {presentWorkers.map(worker => {
                      const isAssigned = assigned?.workerIds.includes(worker.id) || false;
                      const isInOther = !isAssigned && assignedIds.has(worker.id);

                      return (
                        <button
                          key={worker.id}
                          onClick={() => toggleWorkerInActivity(activity, worker.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                            isAssigned
                              ? 'bg-primary/10 border border-primary/30'
                              : isInOther
                                ? 'bg-muted/50 border border-border opacity-60'
                                : 'bg-card border border-border hover:border-primary/30'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                            {worker.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{worker.name}</p>
                            {isInOther && (
                              <p className="text-[10px] text-muted-foreground">
                                En otra actividad
                              </p>
                            )}
                          </div>
                          {isAssigned && (
                            <span className="text-primary text-sm font-bold shrink-0">✓</span>
                          )}
                          {!isAssigned && !isInOther && (
                            <UserPlus className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned workers */}
      {unassignedWorkers.length > 0 && (
        <>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Operarios sin asignar
          </p>
          <div className="glass-card rounded-xl p-4 mb-5">
            <div className="flex flex-wrap gap-2">
              {unassignedWorkers.map(w => (
                <span
                  key={w.id}
                  className="inline-flex items-center gap-1.5 bg-warning/10 text-warning text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[8px] font-bold flex items-center justify-center">
                    {w.avatar}
                  </span>
                  {w.name}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 z-40">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full h-12 text-sm font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl disabled:opacity-40"
            disabled={totalAssigned === 0}
            onClick={onNext}
          >
            Confirmar → Revisar horas
            <span className="ml-2 bg-secondary-foreground/20 text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
              {totalAssigned} asignados
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AsignacionesScreen;
