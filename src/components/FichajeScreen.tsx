import { useState } from "react";
import { mockZones, Worker, FaltaMotivo, WorkerTipo } from "@/lib/mock-data";

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

interface FichajeScreenProps {
  workers: Worker[];
  onUpdateWorkers: (workers: Worker[]) => void;
  onNext: () => void;
}

const FichajeScreen = ({ workers, onUpdateWorkers, onNext }: FichajeScreenProps) => {
  const [generalTime, setGeneralTime] = useState("07:52");
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set());
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);

  const presentes = workers.filter(w => w.status === 'presente').length;
  const faltas = workers.filter(w => w.status === 'falta').length;
  const sinFichar = workers.filter(w => w.status === 'sin-fichar').length;
  const total = workers.length;
  const fichados = presentes + faltas;
  const progress = total > 0 ? Math.round((fichados / total) * 100) : 0;

  const setAllStatus = (status: 'presente' | 'falta') => {
    const updated = workers.map(w => ({
      ...w,
      status,
      clockIn: status === 'presente' ? generalTime : undefined,
      faltaMotivo: status === 'falta' ? 'Sin avisar' as FaltaMotivo : undefined,
    }));
    onUpdateWorkers(updated);
  };

  const setWorkerStatus = (workerId: string, status: 'presente' | 'falta') => {
    const updated = workers.map(w =>
      w.id === workerId
        ? {
            ...w,
            status,
            clockIn: status === 'presente' ? (w.clockIn || generalTime) : undefined,
            faltaMotivo: status === 'falta' ? (w.faltaMotivo || 'Sin avisar') : undefined,
          }
        : w
    );
    onUpdateWorkers(updated);
  };

  const setWorkerMotivo = (workerId: string, motivo: FaltaMotivo) => {
    const updated = workers.map(w =>
      w.id === workerId ? { ...w, faltaMotivo: motivo } : w
    );
    onUpdateWorkers(updated);
  };

  const getZoneWorkers = (zone: typeof mockZones[0]) =>
    workers.filter(w => zone.workers.includes(w.id));

  const getZoneFichados = (zone: typeof mockZones[0]) =>
    getZoneWorkers(zone).filter(w => w.status !== 'sin-fichar').length;

  const toggleZone = (zoneId: string) => {
    setCollapsedZones(prev => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  };

  const progressClass = progress >= 100 ? 'prog-fill-ok' : progress >= 50 ? 'prog-fill-warn' : 'prog-fill-warn';

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3" style={{ marginTop: 4 }}>
        <div className="stat-card">
          <div className="kmi-label">Presentes</div>
          <div className="kmi-value text-success">{presentes}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Faltas</div>
          <div className="kmi-value text-destructive">{faltas}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Sin fichar</div>
          <div className="kmi-value text-warning">{sinFichar}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3.5">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
          <span>Progreso fichaje</span>
          <span>{fichados} de {total}</span>
        </div>
        <div className="prog-track">
          <div className={`prog-fill ${progressClass}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Global time + mark all */}
      <div className="glass-card rounded-[10px] p-3.5 mb-2.5">
        <div className="sec-title mb-2">Hora de entrada general</div>
        <input
          type="time"
          value={generalTime}
          onChange={e => setGeneralTime(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2.5 font-mono text-[20px] font-bold mb-2.5 outline-none"
          style={{ background: 'hsl(var(--background))' }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setAllStatus('presente')}
            className="flex-1 py-2.5 px-1.5 rounded-lg border-none text-[13px] font-bold cursor-pointer flex items-center justify-center gap-1"
            style={{ background: 'hsl(var(--g8))', color: '#fff' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Todos presentes
          </button>
          <button
            onClick={() => setAllStatus('falta')}
            className="flex-1 py-2.5 px-1.5 rounded-lg text-[13px] font-bold cursor-pointer flex items-center justify-center gap-1"
            style={{ background: 'hsl(var(--red-bg))', color: 'hsl(var(--destructive))', border: '1px solid #f5c6c6' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Todos falta
          </button>
        </div>
      </div>

      {/* Zones */}
      {mockZones.map(zone => {
        const zoneWorkers = getZoneWorkers(zone);
        const zoneFichados = getZoneFichados(zone);
        const isCollapsed = collapsedZones.has(zone.id);
        const pillClass = zoneFichados === zoneWorkers.length ? 'pill-ok' : 'pill-gray';

        return (
          <div key={zone.id} className="glass-card rounded-[10px] overflow-hidden mb-2.5">
            {/* Zone header */}
            <div
              className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer active:opacity-80"
              style={{ background: '#f5f5f2', borderBottom: '1px solid hsl(var(--border))' }}
              onClick={() => toggleZone(zone.id)}
            >
              <div>
                <div className="text-[12px] font-bold" style={{ color: 'hsl(var(--g8))' }}>{zone.name} · {zone.activity}</div>
                <div className="text-[10px] text-muted-foreground">{zoneFichados} / {zoneWorkers.length} fichados</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`pill ${pillClass}`}>{zoneFichados}/{zoneWorkers.length}</span>
                <span className="text-[14px] text-muted-foreground transition-transform inline-block" style={{ transform: isCollapsed ? '' : 'rotate(90deg)' }}>›</span>
              </div>
            </div>

            {/* Workers */}
            {!isCollapsed && zoneWorkers.map((worker) => {
              const isPresente = worker.status === 'presente';
              const isFalta = worker.status === 'falta';
              const isExpanded = expandedWorker === worker.id;
              const avatarColors = ['#2c5282', '#e67e22', '#c0392b', '#27ae60', '#8e44ad', '#2fb7a4', '#d4a017', '#744210', '#1abc9c'];
              const colorIdx = parseInt(worker.id) % avatarColors.length;

              return (
                <div key={worker.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                    <div
                      className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: avatarColors[colorIdx] }}
                    >
                      {worker.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold">{worker.name}</span>
                        <TipoBadge tipo={worker.tipo} />
                      </div>
                    </div>
                    {/* Toggle buttons */}
                    <div className="flex border border-border rounded-md overflow-hidden flex-shrink-0">
                      <button
                        onClick={() => setWorkerStatus(worker.id, 'presente')}
                        className="px-2.5 py-1 text-[11px] font-bold border-none cursor-pointer"
                        style={{
                          background: isPresente ? 'hsl(var(--g8))' : 'hsl(var(--background))',
                          color: isPresente ? '#fff' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setWorkerStatus(worker.id, 'falta')}
                        className="px-2.5 py-1 text-[11px] font-bold border-none cursor-pointer"
                        style={{
                          background: isFalta ? 'hsl(var(--destructive))' : 'hsl(var(--background))',
                          color: isFalta ? '#fff' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Falta motivo select */}
                  {isFalta && (
                    <div className="px-3.5 pb-2">
                      <select
                        value={worker.faltaMotivo || 'Sin avisar'}
                        onChange={e => setWorkerMotivo(worker.id, e.target.value as FaltaMotivo)}
                        className="w-full border border-border rounded-md px-2 py-1 text-[11px]"
                        style={{ background: 'hsl(var(--background))' }}
                      >
                        <option>Sin avisar</option>
                        <option>Enfermedad</option>
                        <option>Permiso</option>
                        <option>Retraso</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export default FichajeScreen;
