import { useMemo } from "react";
import { Worker, WorkerTipo } from "@/lib/mock-data";

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
  onNext: () => void;
}

const COST_PER_HOUR = 28;
const DEFAULT_HOURS = 8;
const avatarColors = ['#2c5282', '#e67e22', '#c0392b', '#27ae60', '#8e44ad', '#2fb7a4', '#d4a017', '#744210', '#1abc9c'];

const tipoBadgeStyles: Record<WorkerTipo, { bg: string; color: string }> = {
  DESP: { bg: '#fef3c7', color: '#92400e' },
  LOCAL: { bg: '#ccfbf1', color: '#115e59' },
  FIELD: { bg: '#dbeafe', color: '#1e3a5f' },
};

const HoursScreen = ({ workers, assignments, hoursMap, onUpdateHoursMap, previstasMap, onUpdatePrevistasMap, productionMap, onUpdateProductionMap, onNext }: HoursScreenProps) => {
  // Initialize hours for workers that don't have a value yet
  useMemo(() => {
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
    onUpdateProductionMap(prev => ({
      ...prev,
      [activity]: { ...(prev[activity] || { horaInicio: '', horaFin: '', udsProd: '', tipo: '' }), [field]: value },
    }));
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

  const collapsedTasks = useMemo(() => new Set<string>(), []);
  const [, forceUpdate] = useMemo(() => {
    let val = 0;
    return [val, () => {}];
  }, []);

  // Use state for collapsed
  const { useState } = require("react");
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());
  const toggleTask = (t: string) => {
    setCollapsedSet((prev: Set<string>) => {
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
        const hhUd = prod.udsProd && parseFloat(prod.udsProd) > 0
          ? (totalTaskHH / parseFloat(prod.udsProd)).toFixed(2)
          : '—';
        const previstas = previstasMap[a.activity] ?? DEFAULT_HOURS;

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
