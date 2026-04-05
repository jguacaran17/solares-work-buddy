import { useState, useMemo } from "react";
import { Worker, mockActivitySubtasks, defaultSubtasks, Subtask, WorkerTipo } from "@/lib/mock-data";

interface Assignment {
  activity: string;
  workerIds: string[];
  comment?: string;
}

interface HoursScreenProps {
  workers: Worker[];
  assignments: Assignment[];
  onNext: () => void;
}

const COST_PER_HOUR = 28;
const avatarColors = ['#2c5282', '#e67e22', '#c0392b', '#27ae60', '#8e44ad', '#2fb7a4', '#d4a017', '#744210', '#1abc9c'];

const tipoBadgeStyles: Record<WorkerTipo, { bg: string; color: string }> = {
  DESP: { bg: '#fef3c7', color: '#92400e' },
  LOCAL: { bg: '#ccfbf1', color: '#115e59' },
  FIELD: { bg: '#dbeafe', color: '#1e3a5f' },
};

function getSubtasks(activity: string): Subtask[] {
  return mockActivitySubtasks[activity] || defaultSubtasks;
}

interface SubtaskProduction {
  horaInicio: string;
  horaFin: string;
  udsProd: string;
  tipo: string;
}

const HoursScreen = ({ workers, assignments, onNext }: HoursScreenProps) => {
  const presentWorkers = workers.filter(w => w.status === 'presente');

  const [hoursMap, setHoursMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    assignments.forEach(a => {
      const subtasks = getSubtasks(a.activity);
      const teo = subtasks.reduce((s, st) => s + st.standardHours, 0);
      a.workerIds.forEach(wId => { map[wId] = teo; });
    });
    return map;
  });

  // Production data per subtask (keyed by "activity::subtaskId")
  const [productionMap, setProductionMap] = useState<Record<string, SubtaskProduction>>({});

  const updateProduction = (key: string, field: keyof SubtaskProduction, value: string) => {
    setProductionMap(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { horaInicio: '', horaFin: '', udsProd: '', tipo: '' }), [field]: value },
    }));
  };

  const updateHours = (workerId: string, value: string) => {
    const num = parseFloat(value);
    setHoursMap(prev => ({ ...prev, [workerId]: isNaN(num) ? 0 : num }));
  };

  const stats = useMemo(() => {
    let totalHH = 0;
    let totalTeo = 0;
    const uniqueWorkers = new Set(assignments.flatMap(a => a.workerIds));
    uniqueWorkers.forEach(wId => {
      totalHH += hoursMap[wId] || 0;
      const assignment = assignments.find(a => a.workerIds.includes(wId));
      if (assignment) {
        const subtasks = getSubtasks(assignment.activity);
        totalTeo += subtasks.reduce((s, st) => s + st.standardHours, 0);
      }
    });
    const dv = totalHH - totalTeo;
    const eu = Math.round(dv * COST_PER_HOUR);
    const efficiency = totalTeo > 0 ? Math.min(100, Math.round(totalTeo / Math.max(totalHH, totalTeo) * 100)) : 100;
    return { totalHH, dv, eu, efficiency, totalWorkers: uniqueWorkers.size };
  }, [hoursMap, assignments]);

  // Group by tarea -> subtask -> workers, then expand subtasks inside each activity
  const grouped = useMemo(() => {
    const tMap: Record<string, string> = {
      'Hincado principal': 'Hincado', 'Lima y pintura': 'Acabados',
      'Micropilotes emplantillado': 'Micropilotes', 'Micropilotes hormigonado': 'Micropilotes',
      'Reparto de hincas': 'Micropilotes', 'Corte y mecanizado': 'Acabados',
      'POT': 'Electrico', 'Cableado Motora': 'Electrico', 'Laser': 'Electrico',
      'Repartos Piezeno': 'Estructura', 'Montaje cabezales': 'Estructura',
      'Montaje motora': 'Estructura', 'Montaje tubo torque': 'Estructura',
      'Calidad estructura': 'Estructura', 'Soldado montaje': 'Estructura',
      'Limpieza estructura': 'Limpieza', 'Almacenero': 'Logistica',
      'Estructura': 'Estructura', 'Modulos': 'Modulos', 'Varios': 'Varios',
      'Logistica': 'Logistica',
    };

    const groups: Record<string, { activity: string; subtasks: Subtask[]; workers: { id: string; name: string; avatar: string; clockIn?: string; tipo: WorkerTipo }[]; teo: number; comment?: string }[]> = {};

    assignments.forEach(a => {
      const tarea = tMap[a.activity] || a.activity;
      if (!groups[tarea]) groups[tarea] = [];
      const subtasks = getSubtasks(a.activity);
      const teo = subtasks.reduce((s, st) => s + st.standardHours, 0);
      const ws = a.workerIds.map(wId => {
        const w = workers.find(x => x.id === wId);
        return w ? { id: w.id, name: w.name, avatar: w.avatar, clockIn: w.clockIn, tipo: w.tipo } : null;
      }).filter(Boolean) as { id: string; name: string; avatar: string; clockIn?: string; tipo: WorkerTipo }[];
      groups[tarea].push({ activity: a.activity, subtasks, workers: ws, teo, comment: a.comment });
    });

    return groups;
  }, [assignments, workers]);

  const [collapsedTareas, setCollapsedTareas] = useState<Set<string>>(new Set());
  const toggleTarea = (t: string) => {
    setCollapsedTareas(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const [collapsedSubtasks, setCollapsedSubtasks] = useState<Set<string>>(new Set());
  const toggleSubtask = (key: string) => {
    setCollapsedSubtasks(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
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

      {/* Hours grouped by tarea */}
      {Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([tarea, subs]) => {
        const nOps = subs.reduce((a, s) => a + s.workers.length, 0);
        const isCollapsed = collapsedTareas.has(tarea);

        return (
          <div key={tarea} className="glass-card rounded-[10px] overflow-hidden mb-2.5">
            {/* Tarea header */}
            <div
              className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer active:opacity-80"
              style={{ background: 'hsl(var(--g05))', borderBottom: '1px solid hsl(var(--g1))' }}
              onClick={() => toggleTarea(tarea)}
            >
              <div>
                <div className="text-[13px] font-bold" style={{ color: 'hsl(var(--g8))' }}>{tarea}</div>
                <div className="text-[10px] font-mono" style={{ color: 'hsl(var(--g6))' }}>{nOps} operarios</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="pill pill-ok">OK</span>
                <span className="text-[14px] text-muted-foreground" style={{ transform: isCollapsed ? '' : 'rotate(90deg)', display: 'inline-block', transition: 'transform .2s' }}>›</span>
              </div>
            </div>

            {!isCollapsed && subs.map(sub => {
              return (
                <div key={sub.activity} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  {/* Activity header */}
                  <div className="flex items-center justify-between px-3.5 py-2" style={{ background: '#fafaf8', borderBottom: '1px solid hsl(var(--border))' }}>
                    <span className="text-[12px] font-semibold text-muted-foreground">{sub.activity}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{sub.workers.length} op</span>
                  </div>

                  {/* Subtasks inside this activity */}
                  {sub.subtasks.map(st => {
                    const stKey = `${sub.activity}::${st.id}`;
                    const isStCollapsed = collapsedSubtasks.has(stKey);
                    const prod = productionMap[stKey] || { horaInicio: '', horaFin: '', udsProd: '', tipo: '' };
                    const hhUd = prod.udsProd && parseFloat(prod.udsProd) > 0
                      ? (st.standardHours / parseFloat(prod.udsProd)).toFixed(2)
                      : '—';

                    return (
                      <div key={st.id} style={{ borderBottom: '1px solid #f0f0ec' }}>
                        {/* Subtask header */}
                        <div
                          className="flex items-center justify-between px-4 py-2 cursor-pointer"
                          style={{ background: '#f5f5f2' }}
                          onClick={() => toggleSubtask(stKey)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground" style={{ transform: isStCollapsed ? '' : 'rotate(90deg)', display: 'inline-block', transition: 'transform .2s' }}>›</span>
                            <span className="text-[11px] font-semibold">{st.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{st.standardHours}h std</span>
                        </div>

                        {!isStCollapsed && (
                          <div className="px-4 pb-2">
                            {/* Workers for this subtask */}
                            {sub.workers.map(w => {
                              const val = hoursMap[w.id] ?? sub.teo;
                              const dev = val - sub.teo;
                              const ci = parseInt(w.id) % avatarColors.length;
                              const inputClass = Math.abs(dev) < 0.1 ? 'ok' : dev > 0 ? 'over' : 'ok';

                              return (
                                <div key={w.id} className="flex items-center gap-2 py-1.5" style={{ borderBottom: '1px solid #f0f0ec' }}>
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ background: avatarColors[ci] }}>
                                    {w.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[11px] font-semibold truncate">{w.name}</span>
                                      <span
                                        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none flex-shrink-0"
                                        style={{ background: tipoBadgeStyles[w.tipo].bg, color: tipoBadgeStyles[w.tipo].color }}
                                      >
                                        {w.tipo}
                                      </span>
                                    </div>
                                    <div className="text-[9px] text-muted-foreground font-mono">Entrada {w.clockIn || '07:00'}</div>
                                  </div>
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
                                </div>
                              );
                            })}

                            {/* PRODUCCION fields per subtask */}
                            <div className="mt-2 p-2 rounded-lg" style={{ background: 'hsl(var(--g05))', border: '1px solid hsl(var(--g1))' }}>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Producción</div>
                              <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                                <div>
                                  <label className="text-[9px] text-muted-foreground">Hora inicio</label>
                                  <input
                                    type="time"
                                    value={prod.horaInicio}
                                    onChange={e => updateProduction(stKey, 'horaInicio', e.target.value)}
                                    className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                                    style={{ background: 'hsl(var(--background))' }}
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-muted-foreground">Hora fin</label>
                                  <input
                                    type="time"
                                    value={prod.horaFin}
                                    onChange={e => updateProduction(stKey, 'horaFin', e.target.value)}
                                    className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                                    style={{ background: 'hsl(var(--background))' }}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                <div>
                                  <label className="text-[9px] text-muted-foreground">Uds prod.</label>
                                  <input
                                    type="number"
                                    value={prod.udsProd}
                                    onChange={e => updateProduction(stKey, 'udsProd', e.target.value)}
                                    className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                                    style={{ background: 'hsl(var(--background))' }}
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-muted-foreground">Tipo</label>
                                  <input
                                    type="text"
                                    value={prod.tipo}
                                    onChange={e => updateProduction(stKey, 'tipo', e.target.value)}
                                    className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono"
                                    style={{ background: 'hsl(var(--background))' }}
                                    placeholder="ud/m²"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-muted-foreground">HH/Ud</label>
                                  <div className="w-full border border-border rounded px-1.5 py-1 text-[11px] font-mono font-bold text-center" style={{ background: 'hsl(var(--g1))' }}>
                                    {hhUd}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
