import { useState, useMemo } from "react";
import { Worker, Machine, projectInfo, WorkerTipo } from "@/lib/mock-data";
import { toast } from "sonner";

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

interface EnviarScreenProps {
  workers: Worker[];
  assignments: Assignment[];
  hoursMap: Record<string, number>;
  productionMap: Record<string, TaskProduction>;
  machines: Machine[];
}

const COST_PER_HOUR = 28;
const DEFAULT_HOURS = 8;

const EnviarScreen = ({ workers, assignments, hoursMap, productionMap }: EnviarScreenProps) => {
  const presentWorkers = workers.filter(w => w.status === 'presente');
  const [generalComments, setGeneralComments] = useState('');

  const getHours = (wId: string) => hoursMap[wId] ?? DEFAULT_HOURS;

  // Stats from actual hoursMap
  const stats = useMemo(() => {
    let hh = 0;
    const uniqueWorkers = new Set(assignments.flatMap(a => a.workerIds));
    uniqueWorkers.forEach(wId => { hh += getHours(wId); });
    const teo = uniqueWorkers.size * DEFAULT_HOURS;
    const dv = hh - teo;
    const eu = Math.round(dv * COST_PER_HOUR);
    return { hh, dv, eu };
  }, [assignments, hoursMap]);

  // Activity rows with tipo counts from actual worker data and actual hours
  const activityTipoCounts = useMemo(() => {
    const map: Record<string, { DESP: number; LOCAL: number; FIELD: number; hh: number; comment?: string }> = {};
    assignments.forEach(a => {
      if (!map[a.activity]) map[a.activity] = { DESP: 0, LOCAL: 0, FIELD: 0, hh: 0, comment: a.comment };
      a.workerIds.forEach(wId => {
        const w = workers.find(x => x.id === wId);
        if (w) {
          map[a.activity][w.tipo]++;
          map[a.activity].hh += getHours(wId);
        }
      });
    });
    return map;
  }, [assignments, workers, hoursMap]);

  const handleSend = () => {
    toast.success('Parte enviado. Jefe de obra notificado.');
  };

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  const activeMachines = mockMachines.filter(m => m.status === 'activa');
  const brokenMachines = mockMachines.filter(m => m.status === 'averia');
  const stoppedMachines = mockMachines.filter(m => m.status === 'parada');

  return (
    <>
      <div className="sec-title" style={{ marginTop: 4 }}>Resumen parte — {dateStr}</div>

      {/* Summary KPIs */}
      <div className="glass-card rounded-[10px] p-3.5 mb-2.5">
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">Capataz</span>
          <span className="text-[13px] font-bold font-mono">{projectInfo.foreman}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">Operarios presentes</span>
          <span className="text-[13px] font-bold font-mono text-success">{presentWorkers.length || '—'} operarios</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">HH totales</span>
          <span className="text-[13px] font-bold font-mono">{stats.hh > 0 ? `${stats.hh.toFixed(1)}h` : '—'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">Desviación</span>
          <span className="text-[13px] font-bold font-mono">{stats.dv >= 0 ? '+' : ''}{stats.dv.toFixed(1)}h</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-[12px] text-muted-foreground">Coste extra</span>
          <span className="text-[13px] font-bold font-mono">{stats.eu > 0 ? `-EUR${stats.eu}` : `+EUR${Math.abs(stats.eu)}`}</span>
        </div>
      </div>

      {/* ═══ PARTE MARACOF-E ═══ */}
      <div className="sec-title">Parte MARACOF-E</div>

      <div className="glass-card rounded-[10px] overflow-hidden mb-2.5" style={{ fontSize: '11px' }}>
        {/* Header */}
        <div className="px-3.5 py-3" style={{ background: 'hsl(var(--g8))', color: '#fff' }}>
          <div className="text-[14px] font-bold mb-1">PARTE DIARIO DE TRABAJO</div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div><span className="opacity-70">Proyecto:</span> <span className="font-bold">{projectInfo.name}</span></div>
            <div><span className="opacity-70">Fecha:</span> <span className="font-bold">{dateStr}</span></div>
            <div><span className="opacity-70">Capataz:</span> <span className="font-bold">{projectInfo.foreman}</span></div>
            <div><span className="opacity-70">Presentes:</span> <span className="font-bold">{presentWorkers.length}</span></div>
          </div>
        </div>

        {/* PERSONAL OPERARIO TABLE */}
        <div className="px-0">
          <div className="px-3.5 py-2 font-bold text-[11px] uppercase" style={{ background: 'hsl(var(--g1))', color: 'hsl(var(--g6))', borderBottom: '2px solid hsl(var(--g2))' }}>
            Personal Operario
          </div>

          {/* Table header */}
          <div className="grid gap-0" style={{ gridTemplateColumns: 'minmax(0, 2fr) 36px 36px 36px minmax(0, 1.5fr) 45px', borderBottom: '1px solid hsl(var(--g2))' }}>
            <div className="px-2 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Actividad</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center" style={{ background: '#fef3c7', color: '#92400e' }}>DESP</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center" style={{ background: '#ccfbf1', color: '#115e59' }}>LOC</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center" style={{ background: '#dbeafe', color: '#1e3a5f' }}>FLD</div>
            <div className="px-2 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Comentarios</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>HH</div>
          </div>

          {/* Table rows */}
          {Object.entries(activityTipoCounts).map(([activity, data], i) => (
            <div
              key={activity}
              className="grid gap-0 items-center"
              style={{
                gridTemplateColumns: 'minmax(0, 2fr) 36px 36px 36px minmax(0, 1.5fr) 45px',
                borderBottom: '1px solid hsl(var(--border))',
                background: i % 2 === 0 ? 'transparent' : 'hsl(var(--g05))',
              }}
            >
              <div className="px-2 py-1.5 text-[10px] font-semibold truncate">{activity}</div>
              <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{data.DESP || '—'}</div>
              <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{data.LOCAL || '—'}</div>
              <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{data.FIELD || '—'}</div>
              <div className="px-2 py-1.5 text-[9px] text-muted-foreground truncate">{data.comment || '—'}</div>
              <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{data.hh.toFixed(1)}</div>
            </div>
          ))}

          {/* Totals row */}
          {Object.keys(activityTipoCounts).length > 0 && (
            <div
              className="grid gap-0 items-center"
              style={{
                gridTemplateColumns: 'minmax(0, 2fr) 36px 36px 36px minmax(0, 1.5fr) 45px',
                borderTop: '2px solid hsl(var(--g2))',
                background: 'hsl(var(--g05))',
              }}
            >
              <div className="px-2 py-2 text-[10px] font-bold uppercase">Total</div>
              <div className="px-1 py-2 text-[10px] font-mono text-center font-bold">
                {Object.values(activityTipoCounts).reduce((s, d) => s + d.DESP, 0) || '—'}
              </div>
              <div className="px-1 py-2 text-[10px] font-mono text-center font-bold">
                {Object.values(activityTipoCounts).reduce((s, d) => s + d.LOCAL, 0) || '—'}
              </div>
              <div className="px-1 py-2 text-[10px] font-mono text-center font-bold">
                {Object.values(activityTipoCounts).reduce((s, d) => s + d.FIELD, 0) || '—'}
              </div>
              <div className="px-2 py-2"></div>
              <div className="px-1 py-2 text-[10px] font-mono text-center font-bold">{stats.hh.toFixed(1)}</div>
            </div>
          )}

          {Object.keys(activityTipoCounts).length === 0 && (
            <div className="text-[11px] text-muted-foreground text-center py-4">Sin asignaciones</div>
          )}
        </div>

        {/* DETALLE PRODUCCIÓN */}
        {(() => {
          const prodRows = assignments
            .filter(a => {
              const p = productionMap[a.activity];
              return p && p.udsProd && parseFloat(p.udsProd) > 0;
            })
            .map(a => {
              const p = productionMap[a.activity];
              const uds = parseFloat(p.udsProd);
              const actData = activityTipoCounts[a.activity];
              const hh = actData ? actData.hh : 0;
              const hhUd = uds > 0 ? (hh / uds).toFixed(2) : '—';
              return { activity: a.activity, uds: p.udsProd, tipo: p.tipo, hhUd, hhNum: hh, udsNum: uds };
            });

          if (prodRows.length === 0) return null;

          const totalUds = prodRows.reduce((s, r) => s + r.udsNum, 0);
          const totalHHUd = totalUds > 0 ? (stats.hh / totalUds).toFixed(2) : '—';

          return (
            <div>
              <div className="px-3.5 py-2 font-bold text-[11px] uppercase" style={{ background: 'hsl(var(--g1))', color: 'hsl(var(--g6))', borderBottom: '2px solid hsl(var(--g2))', borderTop: '2px solid hsl(var(--g2))' }}>
                Detalle Producción
              </div>
              <div className="grid gap-0" style={{ gridTemplateColumns: 'minmax(0, 2fr) 55px 50px 50px 55px', borderBottom: '1px solid hsl(var(--g2))' }}>
                <div className="px-2 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Actividad</div>
                <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>UDS. PROD</div>
                <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>TIPO</div>
                <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>HH</div>
                <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>HH/Ud</div>
              </div>
              {prodRows.map((r, i) => (
                <div
                  key={r.activity}
                  className="grid gap-0 items-center"
                  style={{
                    gridTemplateColumns: 'minmax(0, 2fr) 55px 50px 50px 55px',
                    borderBottom: '1px solid hsl(var(--border))',
                    background: i % 2 === 0 ? 'transparent' : 'hsl(var(--g05))',
                  }}
                >
                  <div className="px-2 py-1.5 text-[10px] font-semibold truncate">{r.activity}</div>
                  <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{r.uds}</div>
                  <div className="px-1 py-1.5 text-[10px] font-mono text-center">{r.tipo || '—'}</div>
                  <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{r.hhNum.toFixed(1)}</div>
                  <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{r.hhUd}</div>
                </div>
              ))}
              {/* TOTAL ROW */}
              <div
                className="grid gap-0 items-center"
                style={{
                  gridTemplateColumns: 'minmax(0, 2fr) 55px 50px 50px 55px',
                  borderTop: '2px solid hsl(var(--g2))',
                  background: 'hsl(var(--g05))',
                }}
              >
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase">Total</div>
                <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{totalUds}</div>
                <div className="px-1 py-1.5 text-[10px] font-mono text-center">—</div>
                <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{stats.hh.toFixed(1)}</div>
                <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{totalHHUd}</div>
              </div>
            </div>
          );
        })()}

        {/* MAQUINARIA TABLE */}
        <div>
          <div className="px-3.5 py-2 font-bold text-[11px] uppercase" style={{ background: 'hsl(var(--g1))', color: 'hsl(var(--g6))', borderBottom: '2px solid hsl(var(--g2))', borderTop: '2px solid hsl(var(--g2))' }}>
            Maquinaria
          </div>

          <div className="grid gap-0" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.5fr) 50px 50px', borderBottom: '1px solid hsl(var(--g2))' }}>
            <div className="px-2 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Máquina</div>
            <div className="px-2 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Tarea</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Estado</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>HH</div>
          </div>

          {[...activeMachines, ...brokenMachines, ...stoppedMachines].map((m, i) => (
            <div
              key={m.id}
              className="grid gap-0 items-center"
              style={{
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.5fr) 50px 50px',
                borderBottom: '1px solid hsl(var(--border))',
                background: i % 2 === 0 ? 'transparent' : 'hsl(var(--g05))',
              }}
            >
              <div className="px-2 py-1.5 text-[10px] font-semibold truncate">{m.name}</div>
              <div className="px-2 py-1.5 text-[9px] text-muted-foreground truncate">{m.task}</div>
              <div className="px-1 py-1.5 text-center">
                <span
                  className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase"
                  style={{
                    background: m.status === 'activa' ? '#dcfce7' : m.status === 'averia' ? '#fee2e2' : '#fef9c3',
                    color: m.status === 'activa' ? '#166534' : m.status === 'averia' ? '#991b1b' : '#854d0e',
                  }}
                >
                  {m.status === 'activa' ? 'OK' : m.status === 'averia' ? 'AVR' : 'STOP'}
                </span>
              </div>
              <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{m.hoursToday > 0 ? m.hoursToday.toFixed(1) : '—'}</div>
            </div>
          ))}
        </div>

        {/* COMENTARIOS GENERALES */}
        <div style={{ borderTop: '2px solid hsl(var(--g2))' }}>
          <div className="px-3.5 py-2 font-bold text-[11px] uppercase" style={{ background: 'hsl(var(--g1))', color: 'hsl(var(--g6))' }}>
            Comentarios Generales
          </div>
          <div className="px-3.5 py-2.5">
            <textarea
              value={generalComments}
              onChange={e => setGeneralComments(e.target.value)}
              className="w-full min-h-[60px] border border-border rounded-md px-2.5 py-2 text-[11px] resize-none"
              style={{ background: 'hsl(var(--background))' }}
              placeholder="Observaciones generales del día, incidencias, materiales..."
            />
          </div>
        </div>

        {/* FIRMAS */}
        <div style={{ borderTop: '2px solid hsl(var(--g2))' }}>
          <div className="px-3.5 py-2 font-bold text-[11px] uppercase" style={{ background: 'hsl(var(--g1))', color: 'hsl(var(--g6))' }}>
            Firmas
          </div>
          <div className="grid grid-cols-2 gap-4 px-3.5 py-4">
            <div className="text-center">
              <div className="border-b-2 border-foreground mb-1.5 h-[50px]"></div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Capataz</div>
              <div className="text-[9px] text-muted-foreground">{projectInfo.foreman}</div>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-foreground mb-1.5 h-[50px]"></div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Jefe de Obra</div>
              <div className="text-[9px] text-muted-foreground">Firma pendiente</div>
            </div>
          </div>
        </div>
      </div>

      <button className="sbtn" onClick={handleSend}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        Enviar parte al jefe de obra
      </button>
    </>
  );
};

export default EnviarScreen;
