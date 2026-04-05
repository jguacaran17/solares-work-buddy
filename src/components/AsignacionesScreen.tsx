import { useState } from "react";
import { mockActivities, Worker, WorkerTipo } from "@/lib/mock-data";

interface Assignment {
  activity: string;
  workerIds: string[];
  comment?: string;
}

const tipoBadgeStyles: Record<WorkerTipo, { bg: string; color: string }> = {
  DESP: { bg: '#fef3c7', color: '#92400e' },
  LOCAL: { bg: '#ccfbf1', color: '#115e59' },
  FIELD: { bg: '#dbeafe', color: '#1e3a5f' },
};

const TipoBadge = ({ tipo }: { tipo: WorkerTipo }) => (
  <span
    className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none"
    style={{ background: tipoBadgeStyles[tipo].bg, color: tipoBadgeStyles[tipo].color }}
  >
    {tipo}
  </span>
);

interface AsignacionesScreenProps {
  workers: Worker[];
  assignments: Assignment[];
  onUpdateAssignments: (a: Assignment[]) => void;
  onNext: () => void;
}

const avatarColors = ['#2c5282', '#e67e22', '#c0392b', '#27ae60', '#8e44ad', '#2fb7a4', '#d4a017', '#744210', '#1abc9c'];

const AsignacionesScreen = ({ workers, assignments, onUpdateAssignments, onNext }: AsignacionesScreenProps) => {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const presentWorkers = workers.filter(w => w.status === 'presente');
  const assignedIds = new Set(assignments.flatMap(a => a.workerIds));
  const unassignedWorkers = presentWorkers.filter(w => !assignedIds.has(w.id));
  const totalAssigned = assignedIds.size;
  const progress = presentWorkers.length > 0 ? Math.round((totalAssigned / presentWorkers.length) * 100) : 0;

  const toggleWorkerInActivity = (activity: string, workerId: string) => {
    let updated = [...assignments];
    // Remove from all other activities
    updated = updated.map(a =>
      a.activity !== activity ? { ...a, workerIds: a.workerIds.filter(id => id !== workerId) } : a
    );
    const existing = updated.find(a => a.activity === activity);
    if (existing) {
      const has = existing.workerIds.includes(workerId);
      updated = updated.map(a =>
        a.activity === activity
          ? { ...a, workerIds: has ? a.workerIds.filter(id => id !== workerId) : [...a.workerIds, workerId] }
          : a
      );
    } else {
      updated.push({ activity, workerIds: [workerId] });
    }
    onUpdateAssignments(updated.filter(a => a.workerIds.length > 0));
  };

  const removeFromActivity = (activity: string, workerId: string) => {
    const updated = assignments.map(a =>
      a.activity === activity ? { ...a, workerIds: a.workerIds.filter(id => id !== workerId) } : a
    ).filter(a => a.workerIds.length > 0);
    onUpdateAssignments(updated);
  };

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3" style={{ marginTop: 4 }}>
        <div className="stat-card">
          <div className="kmi-label">Fichados</div>
          <div className="kmi-value text-success">{presentWorkers.length}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Asignados</div>
          <div className="kmi-value text-warning">{totalAssigned}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Sin asignar</div>
          <div className="kmi-value text-warning">{unassignedWorkers.length}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3.5">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
          <span>Progreso asignación</span>
          <span>{progress}%</span>
        </div>
        <div className="prog-track">
          <div className={`prog-fill ${progress >= 100 ? 'prog-fill-ok' : 'prog-fill-warn'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="sec-title">Asigna operarios por actividad</div>

      {/* Activity list */}
      <div className="glass-card rounded-[10px] overflow-hidden mb-2.5">
        <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-border" style={{ background: '#fafaf8' }}>
          <span className="text-[12px] font-bold">Actividades del día</span>
          <span className="text-[10px] text-muted-foreground font-mono">{totalAssigned} asignados</span>
        </div>

        {mockActivities.map((activity) => {
          const assigned = assignments.find(a => a.activity === activity);
          const count = assigned?.workerIds.length || 0;
          const isExpanded = expandedActivity === activity;
          const color = count > 0 ? 'hsl(var(--g6))' : 'hsl(var(--muted-foreground))';

          return (
            <div key={activity} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer"
                onClick={() => setExpandedActivity(isExpanded ? null : activity)}
              >
                <div className="flex-1">
                  <div className="text-[12px] font-bold">{activity}</div>
                  <div className="text-[10px] mt-0.5" style={{ color }}>{count} operario{count !== 1 ? 's' : ''} asignados</div>
                </div>
                <span className="text-[12px] text-muted-foreground">›</span>
              </div>

              {isExpanded && (
                <div className="px-3.5 pb-3 pt-2" style={{ background: '#f8f8f6', borderTop: '1px solid hsl(var(--border))' }}>
                  {/* Already assigned pills */}
                  {count > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {assigned!.workerIds.map(wId => {
                        const w = workers.find(x => x.id === wId);
                        if (!w) return null;
                        const ci = parseInt(w.id) % avatarColors.length;
                        return (
                          <span
                            key={wId}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] cursor-pointer"
                            style={{ background: 'hsl(var(--g05))', border: '1px solid hsl(var(--g2))' }}
                            onClick={() => removeFromActivity(activity, wId)}
                          >
                            <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: avatarColors[ci] }}>{w.avatar}</span>
                            {w.name.split(' ')[0]}
                            <span className="text-destructive text-[10px]">✗</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Available workers */}
                  {(() => {
                    const availableForThis = presentWorkers.filter(w => {
                      if (assigned?.workerIds.includes(w.id)) return false;
                      return true;
                    });
                    return availableForThis.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">Toca para asignar:</span>
                          <button
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer"
                            style={{ background: 'hsl(var(--g6))', color: '#fff' }}
                            onClick={() => {
                              const idsToAdd = availableForThis.map(w => w.id);
                              let updated = [...assignments];
                              // Remove these workers from other activities
                              updated = updated.map(a =>
                                a.activity !== activity ? { ...a, workerIds: a.workerIds.filter(id => !idsToAdd.includes(id)) } : a
                              );
                              const existing = updated.find(a => a.activity === activity);
                              if (existing) {
                                updated = updated.map(a =>
                                  a.activity === activity ? { ...a, workerIds: [...new Set([...a.workerIds, ...idsToAdd])] } : a
                                );
                              } else {
                                updated.push({ activity, workerIds: idsToAdd });
                              }
                              onUpdateAssignments(updated.filter(a => a.workerIds.length > 0));
                            }}
                          >
                            + Asignar todos ({availableForThis.length})
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {availableForThis.map(w => {
                            const isInOther = assignedIds.has(w.id);
                            const ci = parseInt(w.id) % avatarColors.length;
                            return (
                              <span
                                key={w.id}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] cursor-pointer border border-border"
                                style={{ background: 'hsl(var(--card))', opacity: isInOther ? 0.4 : 1 }}
                                onClick={() => toggleWorkerInActivity(activity, w.id)}
                              >
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: avatarColors[ci] }}>{w.avatar}</span>
                                {w.name}
                              </span>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] py-1" style={{ color: 'hsl(var(--g6))' }}>No quedan operarios disponibles</div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned */}
      <div className="sec-title mt-1">Operarios sin asignar</div>
      <div className="glass-card rounded-[10px] p-2.5 mb-2.5">
        <div className="flex flex-wrap gap-1.5">
          {unassignedWorkers.length > 0 ? unassignedWorkers.map(w => {
            const ci = parseInt(w.id) % avatarColors.length;
            return (
              <span key={w.id} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]" style={{ background: 'hsl(var(--red-bg))', border: '1px solid #f5c6c6' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: avatarColors[ci] }}>{w.avatar}</span>
                {w.name}
              </span>
            );
          }) : (
            <div className="text-[12px] py-1" style={{ color: 'hsl(var(--g6))' }}>Todos asignados ✓</div>
          )}
        </div>
      </div>

      <button className="sbtn" onClick={onNext}>Confirmar → Revisar horas</button>
    </>
  );
};

export default AsignacionesScreen;
