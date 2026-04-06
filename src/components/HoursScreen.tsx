import { useState, useMemo, useEffect } from "react";
import { Worker, WorkerTipo, TransferRequest, mockActivitySubtasks, defaultSubtasks } from "@/lib/mock-data";

interface Assignment {
  activity: string;
  workerIds: string[];
  comment?: string;
}

interface TaskProduction {
  horaInicio: string;
  horaFin: string;
  udsProd: string;
  tipo: string;
}

interface HoursScreenProps {
  workers: Worker[];
  assignments: Assignment[];
  hoursMap: Record<string, number>;
  onUpdateHoursMap: (fn: (prev: Record<string, number>) => Record<string, number>) => void;
  previstasMap: Record<string, number>;
  onUpdatePrevistasMap: (fn: (prev: Record<string, number>) => Record<string, number>) => void;
  productionMap: Record<string, TaskProduction>;
  onUpdateProductionMap: (fn: (prev: Record<string, TaskProduction>) => Record<string, TaskProduction>) => void;
  transfers: TransferRequest[];
  onNext: () => void;
}

const COST_PER_HOUR = 28;
const DEFAULT_HOURS = 8;
const avatarColors = ['hsl(216,57%,32%)', 'hsl(28,78%,52%)', 'hsl(6,65%,46%)', 'hsl(152,60%,42%)', 'hsl(282,44%,47%)', 'hsl(168,55%,42%)', 'hsl(40,78%,46%)', 'hsl(28,67%,25%)', 'hsl(168,55%,42%)'];

const tipoBadgeStyles: Record<WorkerTipo, { bg: string; color: string; label: string }> = {
  DESP: { bg: 'hsl(40,96%,89%)', color: 'hsl(28,67%,31%)', label: 'DESP' },
  LOCAL: { bg: 'hsl(168,76%,90%)', color: 'hsl(173,60%,23%)', label: 'LOC' },
  FIELD: { bg: 'hsl(214,95%,93%)', color: 'hsl(216,57%,24%)', label: 'FLD' },
};

// Theoretical HH/Ud for activities (from Historial Producción data)
const THEORETICAL_HH_UD: Record<string, number> = {
  'Modulos': 0.28, 'Trackers': 0.85, 'Hincas': 5.32, 'Marcos': 9.80,
  'Lima/Pintura': 2.11, 'Micropilotes': 7.19, 'Estructura': 1.64, 'Varios': 1.00,
  'Hincado principal': 5.32, 'Lima y pintura': 2.11, 'Micropilotes emplantillado': 7.19,
  'Micropilotes hormigonado': 7.19, 'Montaje cabezales': 9.80, 'Corte y mecanizado': 1.64,
};

const HoursScreen = ({ workers, assignments, hoursMap, onUpdateHoursMap, previstasMap, onUpdatePrevistasMap, productionMap, onUpdateProductionMap, transfers, onNext }: HoursScreenProps) => {
  const approvedTransfers = transfers.filter(t => t.status === 'approved');
  const transferredWorkerIds = new Set(approvedTransfers.map(t => t.workerId));
  const [timeErrors, setTimeErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const missing: Record<string, number> = {};
    assignments.forEach(a => {
      const prev = previstasMap[a.activity] ?? DEFAULT_HOURS;
      a.workerIds.forEach(wId => {
        if (hoursMap[wId] === undefined && missing[wId] === undefined) {
          missing[wId] = prev;
        }
      });
    });
    if (Object.keys(missing).length > 0) {
      onUpdateHoursMap(prev => ({ ...prev, ...missing }));
    }
  }, [assignments]);

  const getHours = (wId: string) => hoursMap[wId] ?? DEFAULT_HOURS;

  const updateProduction = (activity: string, field: keyof TaskProduction, value: string) => {
    onUpdateProductionMap(prev => {
      const current = prev[activity] || { horaInicio: '', horaFin: '', udsProd: '', tipo: '' };
      const updated = { ...current, [field]: value };

      // Validate hora fin > hora inicio
      if (field === 'horaFin' && updated.horaInicio && value && value <= updated.horaInicio) {
        setTimeErrors(e => ({ ...e, [activity]: 'Hora fin debe ser posterior a hora inicio' }));
        return prev; // Don't update
      }
      if (field === 'horaInicio' && updated.horaFin && updated.horaFin <= value) {
        setTimeErrors(e => ({ ...e, [activity]: 'Hora inicio debe ser anterior a hora fin' }));
        return prev;
      }
      setTimeErrors(e => { const n = { ...e }; delete n[activity]; return n; });

      return { ...prev, [activity]: updated };
    });
  };

  const updateHours = (workerId: string, value: string) => {
    const num = parseFloat(value);
    onUpdateHoursMap(prev => ({ ...prev, [workerId]: isNaN(num) ? 0 : num }));
  };

  const updatePrevistas = (activity: string, value: string, workerIds: string[]) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    onUpdatePrevistasMap(prev => ({ ...prev, [activity]: num }));
    onUpdateHoursMap(prev => {
      const next = { ...prev };
      workerIds.forEach(wId => { next[wId] = num; });
      return next;
    });
  };

  const stats = useMemo(() => {
    let totalHH = 0;
    const uniqueWorkers = new Set(assignments.flatMap(a => a.workerIds));
    uniqueWorkers.forEach(wId => { totalHH += getHours(wId); });
    const totalTeo = uniqueWorkers.size * DEFAULT_HOURS;
    const dv = totalHH - totalTeo;
    const eu = Math.round(dv * COST_PER_HOUR);
    const efficiency = totalTeo > 0 ? Math.min(100, Math.round(totalTeo / Math.max(totalHH, totalTeo) * 100)) : 100;
    return { totalHH, dv, eu, efficiency, totalWorkers: uniqueWorkers.size };
  }, [hoursMap, assignments]);

  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());
  const toggleTask = (t: string) => {
    setCollapsedSet(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3" style={{ marginTop: 4 }}>
        <div className="stat-card">
          <div className="kmi-label">HH total</div>
          <div className="kmi-value">{stats.totalWorkers > 0 ? `${stats.totalHH.toFixed(0)}h` : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Desviación</div>
          <div className={`kmi-value ${stats.dv > 1 ? 'text-destructive' : stats.dv > 0 ? 'text-warning' : 'text-success'}`}>
            {stats.totalWorkers > 0 ? `${stats.dv >= 0 ? '+' : ''}${stats.dv.toFixed(1)}h` : '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">€ extra</div>
          <div className={`kmi-value ${stats.eu > 100 ? 'text-destructive' : stats.eu > 0 ? 'text-warning' : 'text-success'}`}>
            {stats.totalWorkers > 0 ? `${stats.eu > 0 ? '-' : '+'}EUR${Math.abs(stats.eu)}` : '—'}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3.5">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
          <span>Eficiencia del día</span>
          <span>{stats.totalWorkers > 0 ? `${stats.efficiency}%` : '—'}</span>
        </div>
        <div className="prog-track">
          <div className={`prog-fill ${stats.efficiency >= 95 ? 'prog-fill-ok' : stats.efficiency >= 80 ? 'prog-fill-warn' : 'prog-fill-danger'}`} style={{ width: `${stats.efficiency}%` }} />
        </div>
      </div>

      <div className="sec-title">Revisa y ajusta horas si hace falta</div>

      {assignments.length > 0 ? assignments.map(a => {
        const isCollapsed = collapsedSet.has(a.activity);
        const taskWorkers = a.workerIds
          .map(wId => workers.find(x => x.id === wId))
          .filter(Boolean) as Worker[];
        const prod = productionMap[a.activity] || { horaInicio: '', horaFin: '', udsProd: '', tipo: '' };
        const totalTaskHH = taskWorkers.reduce((s, w) => s + getHours(w.id), 0);
        const udsNum = prod.udsProd ? parseFloat(prod.udsProd) : 0;
        const hhUd = udsNum > 0 ? (totalTaskHH / udsNum).toFixed(2) : '—';
        const hhUdNum = udsNum > 0 ? totalTaskHH / udsNum : null;
        const theoretical = THEORETICAL_HH_UD[a.activity];
        const previstas = previstasMap[a.activity] ?? DEFAULT_HOURS;
        const subtasks = mockActivitySubtasks[a.activity] || defaultSubtasks;
        const timeError = timeErrors[a.activity];

        // Desviación vs theoretical
        let desvColor = '';
        let desvLabel = '';
        if (hhUdNum !== null && theoretical) {
          const desvPct = ((hhUdNum - theoretical) / theoretical) * 100;
          desvColor = desvPct <= 0 ? '#16a34a' : desvPct < 15 ? '#d97706' : '#dc2626';
          desvLabel = `${desvPct >= 0 ? '+' : ''}${desvPct.toFixed(0)}% vs teórico (${theoretical})`;
        }

        return (
          <div key={a.activity} className="glass-card rounded-[10px] overflow-hidden mb-2.5">
            {/* Task header */}
            <div
              className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer active:opacity-80"
              style={{ background: 'hsl(var(--g05))', borderBottom: '1px solid hsl(var(--g1))' }}
              onClick={() => toggleTask(a.activity)}
            >
              <div>
                <div className="text-[13px] font-bold" style={{ color: 'hsl(var(--g8))' }}>{a.activity}</div>
                <div className="text-[10px] font-mono" style={{ color: 'hsl(var(--g6))' }}>{taskWorkers.length} operarios</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="pill pill-ok">OK</span>
                <span className="text-[14px] text-muted-foreground" style={{ transform: isCollapsed ? '' : 'rotate(90deg)', display: 'inline-block', transition: 'transform .2s' }}>›</span>
              </div>
            </div>

            {!isCollapsed && (
              <div className="px-3.5 pb-3">
                {/* Subtarea assigned */}
                <div className="py-1.5 mb-1" style={{ borderBottom: '1px solid hsl(var(--g1))' }}>
                  <div className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Subtareas asignadas</div>
                  <div className="flex flex-wrap gap-1">
                    {subtasks.map(st => (
                      <span key={st.id} className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono" style={{ background: 'hsl(var(--g1))', color: 'hsl(var(--g7))' }}>
                        {st.name} ({st.standardHours}h)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Horas previstas */}
                <div className="flex items-center gap-2 py-2 mb-1" style={{ borderBottom: '1px solid hsl(var(--g1))' }}>
                  <label className="text-[11px] font-semibold" style={{ color: 'hsl(var(--g6))' }}>Horas previstas</label>
                  <input
                    type="number"
                    value={previstas}
                    step="0.25"
                    min="0"
                    onChange={e => updatePrevistas(a.activity, e.target.value, a.workerIds)}
                    className="w-[56px] border border-border rounded-md px-1.5 py-0.5 text-[12px] font-mono font-bold text-center outline-none"
                    style={{ background: 'hsl(var(--g05))', borderColor: 'hsl(var(--g4))', color: 'hsl(var(--g8))' }}
                  />
                  <span className="text-[9px] text-muted-foreground">→ aplica a todos</span>
                </div>

                {/* Workers */}
                {taskWorkers.map(w => {
                  const val = getHours(w.id);
                  const dev = val - DEFAULT_HOURS;
                  const ci = parseInt(w.id) % avatarColors.length;
                  const inputClass = dev > 0 ? 'over' : 'ok';
                  const transfer = approvedTransfers.find(t => t.workerId === w.id);
                  const isTransferred = !!transfer;
                  const ts = tipoBadgeStyles[w.tipo];

                  return (
                    <div key={w.id} className="py-1.5" style={{ borderBottom: '1px solid #f0f0ec', opacity: isTransferred ? 0.7 : 1 }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ background: avatarColors[ci] }}>
                          {w.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold truncate">{w.name}</span>
                            {isTransferred ? (
                              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none flex-shrink-0" style={{ background: '#fee2e2', color: '#991b1b' }}>TRANSFERIDO</span>
                            ) : (
                              <span
                                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none flex-shrink-0"
                                style={{ background: ts.bg, color: ts.color }}
                              >
                                {ts.label}
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-mono">Entrada {w.clockIn || '07:00'}</div>
                        </div>
                        {!isTransferred ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={val}
                              step="0.25"
                              min="0"
                              onChange={e => updateHours(w.id, e.target.value)}
                              className="w-[48px] border border-border rounded-md px-1 py-0.5 text-[12px] font-mono font-semibold text-center outline-none"
                              style={{
                                background: inputClass === 'over' ? 'hsl(var(--red-bg))' : 'hsl(var(--g05))',
                                borderColor: inputClass === 'over' ? 'hsl(var(--destructive))' : 'hsl(var(--g4))',
                                color: inputClass === 'over' ? 'hsl(var(--destructive))' : 'hsl(var(--g8))',
                              }}
                            />
                            <span
                              className="text-[9px] font-bold font-mono px-1 py-0.5 rounded min-w-[30px] text-center"
                              style={{
                                background: dev > 0 ? 'hsl(var(--red-bg))' : 'hsl(var(--g1))',
                                color: dev > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--g8))',
                              }}
                            >
                              {dev > 0 ? '+' : ''}{dev.toFixed(1)}h
                            </span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold">{transfer.hoursBeforeTransfer}h</span>
                          </div>
                        )}
                      </div>
                      {isTransferred && transfer && (
                        <div className="ml-8 mt-1 flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--g1))' }}>Antes: {transfer.hoursBeforeTransfer}h</span>
                          <span>→</span>
                          <span className="px-1.5 py-0.5 rounded" style={{ background: '#fef3c7' }}>Después: {transfer.hoursAfterTransfer}h ({transfer.toActivity})</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* PRODUCCION block per task */}
                <div className="mt-2 p-2 rounded-lg" style={{ background: 'hsl(var(--g05))', border: '1px solid hsl(var(--g1))' }}>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Producción</div>
                  <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Hora inicio</label>
                      <input
                        type="time"
                        value={prod.horaInicio}
                        onChange={e => updateProduction(a.activity, 'horaInicio', e.target.value)}
                        className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                        style={{ background: 'hsl(var(--background))' }}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Hora fin</label>
                      <input
                        type="time"
                        value={prod.horaFin}
                        onChange={e => updateProduction(a.activity, 'horaFin', e.target.value)}
                        className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                        style={{ background: 'hsl(var(--background))', borderColor: timeError ? '#dc2626' : undefined }}
                        min={prod.horaInicio || undefined}
                      />
                      {timeError && <div className="text-[8px] mt-0.5" style={{ color: '#dc2626' }}>{timeError}</div>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Uds prod.</label>
                      <input
                        type="number"
                        value={prod.udsProd}
                        onChange={e => updateProduction(a.activity, 'udsProd', e.target.value)}
                        className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                        style={{ background: 'hsl(var(--background))' }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Tipo</label>
                      <select
                        value={prod.tipo}
                        onChange={e => updateProduction(a.activity, 'tipo', e.target.value)}
                        className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                        style={{ background: 'hsl(var(--background))' }}
                      >
                        <option value="">—</option>
                        <option value="Vd">Vd</option>
                        <option value="Ud">Ud</option>
                        <option value="ml">ml</option>
                        <option value="m2">m²</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">HH/Ud</label>
                      <div className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono font-bold text-center" style={{ background: 'hsl(var(--g1))' }}>
                        {hhUd}
                      </div>
                    </div>
                  </div>
                  {/* Desviación vs theoretical */}
                  {desvLabel && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: desvColor }} />
                      <span className="text-[9px] font-bold font-mono" style={{ color: desvColor }}>{desvLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }) : (
        <div className="glass-card rounded-[10px] p-4 text-center text-[12px] text-muted-foreground">
          Sin operarios asignados
        </div>
      )}

      <button className="sbtn" onClick={onNext}>Revisar resumen → Enviar</button>
    </>
  );
};

export default HoursScreen;
