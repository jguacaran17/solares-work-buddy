import { useState } from "react";
import { mockActivities, Worker, WorkerTipo, TransferRequest } from "@/lib/mock-data";

interface Assignment {
  activity: string;
  workerIds: string[];
  comment?: string;
}

const tipoBadgeStyles: Record<WorkerTipo, { bg: string; color: string }> = {
  DESP: { bg: 'hsl(40,96%,89%)', color: 'hsl(28,67%,31%)' },
  LOCAL: { bg: 'hsl(168,76%,90%)', color: 'hsl(173,60%,23%)' },
  FIELD: { bg: 'hsl(214,95%,93%)', color: 'hsl(216,57%,24%)' },
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
  transfers: TransferRequest[];
  onNext: () => void;
}

const avatarColors = ['hsl(216,57%,32%)', 'hsl(28,78%,52%)', 'hsl(6,65%,46%)', 'hsl(152,60%,42%)', 'hsl(282,44%,47%)', 'hsl(168,55%,42%)', 'hsl(40,78%,46%)', 'hsl(28,67%,25%)', 'hsl(168,55%,42%)'];

const AsignacionesScreen = ({ workers, assignments, onUpdateAssignments, transfers, onNext }: AsignacionesScreenProps) => {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const approvedTransferWorkerIds = new Set(transfers.filter(t => t.status === 'approved').map(t => t.workerId));

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
      <div className="glass-card overflow-hidden mb-2.5">
        <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-border" style={{ background: 'hsl(var(--teal-bg))' }}>
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
                <div className="px-3.5 pb-3 pt-2" style={{ background: 'hsl(var(--teal-bg))', borderTop: '1px solid hsl(var(--border))' }}>
                  {/* Already assigned pills grouped by tipo */}
                  {count > 0 && (() => {
                    const assignedWorkers = assigned!.workerIds.map(wId => workers.find(x => x.id === wId)).filter(Boolean) as Worker[];
                    const groups: { tipo: WorkerTipo; label: string; items: typeof assignedWorkers }[] = [
                      { tipo: 'DESP', label: 'DESPLAZADOS', items: assignedWorkers.filter(w => w.tipo === 'DESP') },
                      { tipo: 'LOCAL', label: 'LOCAL', items: assignedWorkers.filter(w => w.tipo === 'LOCAL') },
                      { tipo: 'FIELD', label: 'FIELD', items: assignedWorkers.filter(w => w.tipo === 'FIELD') },
                    ];
                    return (
                      <div className="mb-2">
                        {groups.map(group => {
                          if (group.items.length === 0) return null;
                          return (
                            <div key={group.tipo} className="mb-1.5">
                              <div className="text-[9px] font-bold uppercase text-muted-foreground mb-1" style={{ letterSpacing: '0.06em' }}>{group.label}</div>
                              <div className="flex flex-wrap gap-1.5">
                                {group.items.map(w => {
                                  const ci = parseInt(w.id) % avatarColors.length;
                                  const isTransferred = approvedTransferWorkerIds.has(w.id);
                                  return (
                                    <span
                                      key={w.id}
                                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px]"
                                      style={{
                                        background: isTransferred ? '#fee2e2' : 'hsl(var(--g05))',
                                        border: isTransferred ? '1px solid #fca5a5' : '1px solid hsl(var(--g2))',
                                        opacity: isTransferred ? 0.7 : 1,
                                        cursor: isTransferred ? 'default' : 'pointer',
                                      }}
                                      onClick={() => !isTransferred && removeFromActivity(activity, w.id)}
                                    >
                                      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: avatarColors[ci] }}>{w.avatar}</span>
                                      {w.name.split(' ')[0]}
                                      {isTransferred ? (
                                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none" style={{ background: '#fee2e2', color: '#991b1b' }}>TRANSFERIDO</span>
                                      ) : (
                                        <>
                                          <TipoBadge tipo={w.tipo} />
                                          <span className="text-destructive text-[10px]">✗</span>
                                        </>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Available workers grouped by tipo */}
                  {(() => {
                    const availableForThis = presentWorkers.filter(w => {
                      if (assigned?.workerIds.includes(w.id)) return false;
                      return true;
                    });
                    if (availableForThis.length === 0) {
                      return <div className="text-[11px] py-1" style={{ color: 'hsl(var(--g6))' }}>No quedan operarios disponibles</div>;
                    }

                    const groups: { tipo: WorkerTipo; label: string; workers: typeof availableForThis }[] = [
                      { tipo: 'DESP', label: 'DESPLAZADOS', workers: availableForThis.filter(w => w.tipo === 'DESP') },
                      { tipo: 'LOCAL', label: 'LOCAL', workers: availableForThis.filter(w => w.tipo === 'LOCAL') },
                      { tipo: 'FIELD', label: 'FIELD', workers: availableForThis.filter(w => w.tipo === 'FIELD') },
                    ];

                    return (
                      <>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">Toca para asignar:</span>
                          <button
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer"
                            style={{ background: '#0f1f3a', color: '#fff' }}
                            onClick={() => {
                              const idsToAdd = availableForThis.map(w => w.id);
                              let updated = [...assignments];
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
                        {groups.map(group => {
                          if (group.workers.length === 0) return null;
                          return (
                            <div key={group.tipo} className="mb-2">
                              <div className="text-[9px] font-bold uppercase text-muted-foreground mb-1 mt-1" style={{ letterSpacing: '0.06em' }}>{group.label}</div>
                              <div className="flex flex-wrap gap-1.5">
                                {group.workers.map(w => {
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
                                      <TipoBadge tipo={w.tipo} />
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}

                  {/* Comment input per activity */}
                  <div className="mt-3 pt-2" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Comentarios de tarea</label>
                    <textarea
                      value={assigned?.comment || ''}
                      onChange={e => {
                        let updated = [...assignments];
                        const existing = updated.find(a => a.activity === activity);
                        if (existing) {
                          updated = updated.map(a => a.activity === activity ? { ...a, comment: e.target.value } : a);
                        } else {
                          updated.push({ activity, workerIds: [], comment: e.target.value });
                        }
                        onUpdateAssignments(updated);
                      }}
                      className="w-full min-h-[40px] border border-border rounded-md px-2 py-1.5 text-[11px] resize-none"
                      style={{ background: 'hsl(var(--background))' }}
                      placeholder="Notas para esta actividad..."
                    />
                  </div>
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
