import { useState, useMemo } from "react";
import { Worker, mockActivitySubtasks, defaultSubtasks, Subtask } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown } from "lucide-react";

interface Assignment {
  activity: string;
  workerIds: string[];
}

interface SubtaskHours {
  [activityWorkerSubtask: string]: number;
}

interface HoursScreenProps {
  workers: Worker[];
  assignments: Assignment[];
  onNext: () => void;
}

const STANDARD_HOURS = 8;
const EXTRA_COST_PER_HOUR = 25;

function getSubtasks(activity: string): Subtask[] {
  return mockActivitySubtasks[activity] || defaultSubtasks;
}

function makeKey(activity: string, workerId: string, subtaskId: string) {
  return `${activity}__${workerId}__${subtaskId}`;
}

const HoursScreen = ({ workers, assignments, onNext }: HoursScreenProps) => {
  const presentWorkers = workers.filter(w => w.status === 'presente');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const [hoursMap, setHoursMap] = useState<SubtaskHours>(() => {
    const map: SubtaskHours = {};
    assignments.forEach(a => {
      const subtasks = getSubtasks(a.activity);
      a.workerIds.forEach(wId => {
        subtasks.forEach(st => {
          map[makeKey(a.activity, wId, st.id)] = st.standardHours;
        });
      });
    });
    return map;
  });

  const updateHours = (key: string, value: string) => {
    const num = parseFloat(value);
    setHoursMap(prev => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  // Per-worker total hours across all assignments
  const workerTotalHours = useMemo(() => {
    const totals: Record<string, number> = {};
    assignments.forEach(a => {
      const subtasks = getSubtasks(a.activity);
      a.workerIds.forEach(wId => {
        if (!totals[wId]) totals[wId] = 0;
        subtasks.forEach(st => {
          totals[wId] += hoursMap[makeKey(a.activity, wId, st.id)] || 0;
        });
      });
    });
    return totals;
  }, [hoursMap, assignments]);

  const stats = useMemo(() => {
    let totalReal = 0;
    let totalStandard = 0;
    const uniqueWorkers = new Set(assignments.flatMap(a => a.workerIds));

    uniqueWorkers.forEach(wId => {
      totalReal += workerTotalHours[wId] || 0;
      totalStandard += STANDARD_HOURS;
    });

    const deviation = totalReal - totalStandard;
    const extraCost = deviation > 0 ? deviation * EXTRA_COST_PER_HOUR : 0;
    const efficiency = totalStandard > 0 ? Math.round((totalStandard / Math.max(totalReal, 0.01)) * 100) : 0;

    return { totalReal, totalStandard, deviation, extraCost, efficiency, totalAssignedWorkers: uniqueWorkers.size };
  }, [workerTotalHours, assignments]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="stat-card">
          <p className="text-lg font-bold">{stats.totalReal > 0 ? stats.totalReal.toFixed(1) : '—'}</p>
          <p className="text-[11px] text-muted-foreground font-medium">HH total</p>
        </div>
        <div className="stat-card">
          <p className={`text-lg font-bold ${stats.deviation > 0 ? 'text-destructive' : stats.deviation < 0 ? 'text-[hsl(152,60%,42%)]' : ''}`}>
            {stats.totalAssignedWorkers > 0 ? `${stats.deviation > 0 ? '+' : ''}${stats.deviation.toFixed(1)}` : '—'}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">Desviación</p>
        </div>
        <div className="stat-card">
          <p className={`text-lg font-bold ${stats.extraCost > 0 ? 'text-destructive' : ''}`}>
            {stats.totalAssignedWorkers > 0 ? `${stats.extraCost.toFixed(0)}€` : '—'}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">€ extra</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">Eficiencia del día</span>
          <span className="font-bold">{stats.totalAssignedWorkers > 0 ? `${stats.efficiency}%` : '—'}</span>
        </div>
        <Progress value={Math.min(stats.efficiency, 100)} className="h-2" />
      </div>

      <p className="text-xs text-muted-foreground mb-4 font-medium">Revisa y ajusta horas por subtarea</p>

      {/* Hours by assignment grouped by subtask */}
      {assignments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {assignments.map(assignment => {
            const assignedWorkers = workers.filter(w => assignment.workerIds.includes(w.id));
            const subtasks = getSubtasks(assignment.activity);
            const isExpanded = expandedActivity === assignment.activity;

            let activityTotal = 0;
            assignedWorkers.forEach(w => {
              subtasks.forEach(st => {
                activityTotal += hoursMap[makeKey(assignment.activity, w.id, st.id)] || 0;
              });
            });

            return (
              <div key={assignment.activity} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedActivity(isExpanded ? null : assignment.activity)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left active:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-bold truncate">{assignment.activity}</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {assignedWorkers.length} op.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono font-bold">{activityTotal.toFixed(1)}h</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 pb-4 space-y-4">
                    {subtasks.map(subtask => {
                      let subtaskTotal = 0;
                      assignedWorkers.forEach(w => {
                        subtaskTotal += hoursMap[makeKey(assignment.activity, w.id, subtask.id)] || 0;
                      });

                      return (
                        <div key={subtask.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">{subtask.name}</span>
                            <span className="text-xs font-mono font-bold">{subtaskTotal.toFixed(1)}h</span>
                          </div>
                          <div className="space-y-2">
                            {assignedWorkers.map(w => {
                              const key = makeKey(assignment.activity, w.id, subtask.id);
                              const val = hoursMap[key] ?? subtask.standardHours;
                              const totalForWorker = workerTotalHours[w.id] || 0;
                              const deviation = totalForWorker - STANDARD_HOURS;

                              return (
                                <div key={w.id} className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {w.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{w.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Entrada {w.clockIn || '07:00'}
                                    </p>
                                  </div>
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    max="24"
                                    value={val}
                                    onChange={e => updateHours(key, e.target.value)}
                                    className="w-16 h-8 text-sm font-mono font-bold text-right bg-muted/50 border border-border rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                  />
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                      deviation > 0
                                        ? 'bg-destructive/10 text-destructive'
                                        : 'bg-[hsl(152,60%,42%,0.1)] text-[hsl(152,60%,30%)]'
                                    }`}
                                  >
                                    {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}h
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-6 text-center mb-4">
          <p className="text-sm text-muted-foreground">No hay asignaciones aún</p>
        </div>
      )}

      <Button className="w-full h-12 text-sm font-bold rounded-xl" onClick={onNext}>
        Revisar resumen → Enviar
      </Button>
    </div>
  );
};

export default HoursScreen;
