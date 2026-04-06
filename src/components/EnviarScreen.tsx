import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Worker, Machine, projectInfo, WorkerTipo, mockZones, TransferRequest } from "@/lib/mock-data";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import jsPDF from "jspdf";

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
  transfers: TransferRequest[];
}

const COST_PER_HOUR = 28;
const DEFAULT_HOURS = 8;

const TIPO_STYLES: Record<WorkerTipo, { bg: string; color: string; label: string }> = {
  DESP: { bg: '#fef3c7', color: '#92400e', label: 'DESP' },
  LOCAL: { bg: '#ccfbf1', color: '#115e59', label: 'LOC' },
  FIELD: { bg: '#dbeafe', color: '#1e3a5f', label: 'FLD' },
};

// ── Signature Canvas Component ──
const SignatureCanvas = ({ label, subtitle }: { label: string; subtitle: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
  }, [getPos]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f1f3a';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPos]);

  const stopDraw = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(2, 2);
  }, []);

  return (
    <div className="text-center">
      <canvas
        ref={canvasRef}
        className="w-full border border-border rounded-md mb-1 bg-white cursor-crosshair"
        style={{ height: 80, touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="text-[10px] font-bold text-muted-foreground uppercase">{label}</div>
      <div className="text-[9px] text-muted-foreground">{subtitle}</div>
      {hasSignature && (
        <button
          className="text-[9px] font-bold mt-1 px-2 py-0.5 rounded border border-border text-destructive"
          onClick={clearCanvas}
        >
          Borrar
        </button>
      )}
    </div>
  );
};


const getWorkerZone = (workerId: string): string => {
  for (const z of mockZones) {
    if (z.workers.includes(workerId)) return `${z.name} · ${z.activity}`;
  }
  return '—';
};

// Helper: find zone label for an activity (best match from assigned workers)
const getActivityZone = (workerIds: string[]): string => {
  if (workerIds.length === 0) return '—';
  // Use the zone of the first worker
  return getWorkerZone(workerIds[0]);
};

const EnviarScreen = ({ workers, assignments, hoursMap, productionMap, machines, transfers }: EnviarScreenProps) => {
  const presentWorkers = workers.filter(w => w.status === 'presente');
  const approvedTransfers = transfers.filter(t => t.status === 'approved');
  const transferredWorkerIds = new Set(approvedTransfers.map(t => t.workerId));
  const [generalComments, setGeneralComments] = useState('');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);

  const getHours = (wId: string) => hoursMap[wId] ?? DEFAULT_HOURS;

  const stats = useMemo(() => {
    let hh = 0;
    const uniqueWorkers = new Set(assignments.flatMap(a => a.workerIds));
    uniqueWorkers.forEach(wId => { hh += getHours(wId); });
    const teo = uniqueWorkers.size * DEFAULT_HOURS;
    const dv = hh - teo;
    const eu = Math.round(dv * COST_PER_HOUR);
    return { hh, dv, eu };
  }, [assignments, hoursMap]);

  // Zone breakdown stats
  const zoneStats = useMemo(() => {
    const map: Record<string, { workers: number; hh: number }> = {};
    for (const z of mockZones) {
      const key = `${z.name} · ${z.activity}`;
      const zoneWorkerIds = new Set(z.workers);
      const assignedInZone = new Set<string>();
      assignments.forEach(a => {
        a.workerIds.forEach(wId => {
          if (zoneWorkerIds.has(wId)) assignedInZone.add(wId);
        });
      });
      let hh = 0;
      assignedInZone.forEach(wId => { hh += getHours(wId); });
      if (assignedInZone.size > 0) {
        map[key] = { workers: assignedInZone.size, hh };
      }
    }
    return map;
  }, [assignments, hoursMap]);

  const activityTipoCounts = useMemo(() => {
    const map: Record<string, { DESP: number; LOCAL: number; FIELD: number; hh: number; comment?: string; zone: string; workers: { id: string; name: string; tipo: WorkerTipo; hours: number }[] }> = {};
    assignments.forEach(a => {
      if (!map[a.activity]) map[a.activity] = { DESP: 0, LOCAL: 0, FIELD: 0, hh: 0, comment: a.comment, zone: getActivityZone(a.workerIds), workers: [] };
      a.workerIds.forEach(wId => {
        const w = workers.find(x => x.id === wId);
        if (w) {
          map[a.activity][w.tipo]++;
          const hours = getHours(wId);
          map[a.activity].hh += hours;
          map[a.activity].workers.push({ id: w.id, name: w.name, tipo: w.tipo, hours });
        }
      });
    });
    return map;
  }, [assignments, workers, hoursMap]);

  const [submitted, setSubmitted] = useState(false);

  const handleSend = () => {
    toast.success('Parte enviado. Jefe de obra notificado.');
    setSubmitted(true);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    // Header
    doc.setFillColor(15, 31, 58);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('PARTE DIARIO DE TRABAJO', 15, 15);
    doc.setFontSize(10);
    doc.text(`${projectInfo.name} · ${dateStr}`, 15, 23);
    doc.text(`Capataz: ${projectInfo.foreman}`, 15, 30);

    doc.setTextColor(0, 0, 0);
    let y = 45;

    // Workers by activity
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Operario', 15, y); y += 7;

    Object.entries(activityTipoCounts).forEach(([activity, data]) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(activity, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.hh.toFixed(1)}h · D:${data.DESP} L:${data.LOCAL} F:${data.FIELD}`, 100, y);
      y += 5;
      data.workers.forEach(w => {
        const badge = TIPO_STYLES[w.tipo].label;
        doc.setFontSize(8);
        doc.text(`  ${w.name} [${badge}] — ${w.hours.toFixed(1)}h`, 20, y);
        y += 4;
      });
      y += 2;
    });

    // Machines
    y += 3;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Maquinaria & Flota', 15, y); y += 7;
    machines.filter(m => m.status === 'activa').forEach(m => {
      if (y > 275) { doc.addPage(); y = 20; }
      const ops = m.operators.map(id => workers.find(w => w.id === id)?.name || '?').join(', ');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${m.name} · ${m.hoursToday.toFixed(1)}h · ${ops || 'Sin op.'}`, 15, y);
      y += 5;
    });

    // Production
    y += 3;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Producción', 15, y); y += 7;
    assignments.forEach(a => {
      const p = productionMap[a.activity];
      if (p && p.udsProd && parseFloat(p.udsProd) > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${a.activity}: ${p.udsProd} uds (${p.tipo || '—'})`, 15, y);
        y += 5;
      }
    });

    // Summary
    y += 5;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`HH Totales: ${stats.hh.toFixed(1)}h | Desviación: ${stats.dv >= 0 ? '+' : ''}${stats.dv.toFixed(1)}h | Coste extra: EUR${stats.eu}`, 15, y);

    doc.save(`parte_diario_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

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
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">Coste extra</span>
          <span className="text-[13px] font-bold font-mono">{stats.eu > 0 ? `-EUR${stats.eu}` : `+EUR${Math.abs(stats.eu)}`}</span>
        </div>

        {/* Zone breakdown */}
        {Object.keys(zoneStats).length > 0 && (
          <>
            <div className="pt-2 pb-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Desglose por zona</span>
            </div>
            {Object.entries(zoneStats).map(([zone, data]) => (
              <div key={zone} className="flex justify-between py-1.5 border-b border-border last:border-b-0">
                <span className="text-[11px] text-muted-foreground">{zone}</span>
                <span className="text-[11px] font-mono font-bold">{data.workers} op. · {data.hh.toFixed(1)}h</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* PARTE MARACOF-E */}
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
          <div className="grid gap-0" style={{ gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr) 30px 30px 30px minmax(0, 1fr) 40px', borderBottom: '1px solid hsl(var(--g2))' }}>
            <div className="px-2 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Actividad</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Zona</div>
            <div className="px-0.5 py-1.5 font-bold text-[8px] uppercase text-center" style={{ background: '#fef3c7', color: '#92400e' }}>D</div>
            <div className="px-0.5 py-1.5 font-bold text-[8px] uppercase text-center" style={{ background: '#ccfbf1', color: '#115e59' }}>L</div>
            <div className="px-0.5 py-1.5 font-bold text-[8px] uppercase text-center" style={{ background: '#dbeafe', color: '#1e3a5f' }}>F</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Comentarios</div>
            <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>HH</div>
          </div>

          {/* Table rows with expandable detail */}
          {Object.entries(activityTipoCounts).map(([activity, data], i) => {
            const isExpanded = expandedActivity === activity;
            return (
              <div key={activity}>
                <div
                  className="grid gap-0 items-center cursor-pointer"
                  style={{
                    gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr) 30px 30px 30px minmax(0, 1fr) 40px',
                    borderBottom: isExpanded ? 'none' : '1px solid hsl(var(--border))',
                    background: i % 2 === 0 ? 'transparent' : 'hsl(var(--g05))',
                  }}
                  onClick={() => setExpandedActivity(isExpanded ? null : activity)}
                >
                  <div className="px-2 py-1.5 text-[10px] font-semibold truncate flex items-center gap-1">
                    <ChevronDown
                      size={12}
                      className="flex-shrink-0 text-muted-foreground transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    />
                    {activity}
                  </div>
                  <div className="px-1 py-1.5 text-[9px] text-muted-foreground truncate">{data.zone}</div>
                  <div className="px-0.5 py-1.5 text-[10px] font-mono text-center font-bold">{data.DESP || '—'}</div>
                  <div className="px-0.5 py-1.5 text-[10px] font-mono text-center font-bold">{data.LOCAL || '—'}</div>
                  <div className="px-0.5 py-1.5 text-[10px] font-mono text-center font-bold">{data.FIELD || '—'}</div>
                  <div className="px-1 py-1.5 text-[9px] text-muted-foreground truncate">{data.comment || '—'}</div>
                  <div className="px-1 py-1.5 text-[10px] font-mono text-center font-bold">{data.hh.toFixed(1)}</div>
                </div>

                {/* Expanded worker detail */}
                {isExpanded && data.workers.length > 0 && (
                  <div style={{ background: 'hsl(var(--g05))', borderBottom: '1px solid hsl(var(--border))' }}>
                    {data.workers.map((w) => {
                      const ts = TIPO_STYLES[w.tipo];
                      return (
                        <div key={w.id} style={{ borderTop: '1px solid hsl(var(--border))', marginLeft: 16 }}>
                          <div className="flex items-center gap-2 px-4 py-1.5">
                            <span className="text-[10px] font-medium flex-1 truncate">{w.name}</span>
                            {transferredWorkerIds.has(w.id) ? (
                              <span className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase" style={{ background: '#fee2e2', color: '#991b1b' }}>TRANSFERIDO</span>
                            ) : (
                              <span className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase" style={{ background: ts.bg, color: ts.color }}>{ts.label}</span>
                            )}
                            <span className="text-[10px] font-mono font-bold w-[36px] text-right">{w.hours.toFixed(1)}h</span>
                          </div>
                          {(() => {
                            const transfer = approvedTransfers.find(t => t.workerId === w.id);
                            if (!transfer) return null;
                            return (
                              <div className="px-4 pb-1.5 text-[9px] font-mono text-muted-foreground" style={{ marginLeft: 4 }}>
                                Transferido · HH hasta traslado: {transfer.hoursBeforeTransfer}h → {transfer.toZone}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Totals row */}
          {Object.keys(activityTipoCounts).length > 0 && (
            <div
              className="grid gap-0 items-center"
              style={{
                gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr) 30px 30px 30px minmax(0, 1fr) 40px',
                borderTop: '2px solid hsl(var(--g2))',
                background: 'hsl(var(--g05))',
              }}
            >
              <div className="px-2 py-2 text-[10px] font-bold uppercase">Total</div>
              <div className="px-1 py-2"></div>
              <div className="px-0.5 py-2 text-[10px] font-mono text-center font-bold">
                {Object.values(activityTipoCounts).reduce((s, d) => s + d.DESP, 0) || '—'}
              </div>
              <div className="px-0.5 py-2 text-[10px] font-mono text-center font-bold">
                {Object.values(activityTipoCounts).reduce((s, d) => s + d.LOCAL, 0) || '—'}
              </div>
              <div className="px-0.5 py-2 text-[10px] font-mono text-center font-bold">
                {Object.values(activityTipoCounts).reduce((s, d) => s + d.FIELD, 0) || '—'}
              </div>
              <div className="px-1 py-2"></div>
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

        {/* MAQUINARIA / FLOTA TABLES with expandable rows */}
        {(['maquinaria', 'flota'] as const).map(cat => {
          const catMachines = machines.filter(m => m.category === cat);
          if (catMachines.length === 0) return null;
          const catActive = catMachines.filter(m => m.status === 'activa');
          const catBroken = catMachines.filter(m => m.status === 'averia');
          const catStopped = catMachines.filter(m => m.status === 'parada');
          const sorted = [...catActive, ...catBroken, ...catStopped];
          const title = cat === 'maquinaria' ? 'Maquinaria' : 'Flota';
          const totalHH = catActive.reduce((sum, m) => sum + m.hoursToday, 0);
          return (
            <div key={cat}>
              <div className="px-3.5 py-2 font-bold text-[11px] uppercase" style={{ background: 'hsl(var(--g1))', color: 'hsl(var(--g6))', borderBottom: '2px solid hsl(var(--g2))', borderTop: '2px solid hsl(var(--g2))' }}>
                {title}
              </div>
              <div className="grid gap-0" style={{ gridTemplateColumns: 'minmax(0, 2fr) 50px 50px', borderBottom: '1px solid hsl(var(--g2))' }}>
                <div className="px-2 py-1.5 font-bold text-[9px] uppercase text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Máquina</div>
                <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>Estado</div>
                <div className="px-1 py-1.5 font-bold text-[9px] uppercase text-center text-muted-foreground" style={{ background: 'hsl(var(--g05))' }}>HH</div>
              </div>
              {sorted.map((m, i) => {
                const isExpanded = expandedMachine === m.id;
                const operatorWorkers = m.operators.map(opId => workers.find(w => w.id === opId)).filter(Boolean) as Worker[];
                return (
                  <div key={m.id}>
                    <div
                      className="grid gap-0 items-center cursor-pointer"
                      style={{
                        gridTemplateColumns: 'minmax(0, 2fr) 50px 50px',
                        borderBottom: isExpanded ? 'none' : '1px solid hsl(var(--border))',
                        background: i % 2 === 0 ? 'transparent' : 'hsl(var(--g05))',
                      }}
                      onClick={() => setExpandedMachine(isExpanded ? null : m.id)}
                    >
                      <div className="px-2 py-1.5 text-[10px] font-semibold truncate flex items-center gap-1">
                        <ChevronDown
                          size={12}
                          className="flex-shrink-0 text-muted-foreground transition-transform duration-200"
                          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                        />
                        {m.name}
                      </div>
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

                    {/* Expanded machine detail */}
                    {isExpanded && (
                      <div style={{ background: 'hsl(var(--g05))', borderBottom: '1px solid hsl(var(--border))' }}>
                        {/* Task */}
                        <div className="flex items-center gap-2 px-4 py-1.5" style={{ borderTop: '1px solid hsl(var(--border))', marginLeft: 16 }}>
                          <span className="text-[9px] font-bold uppercase text-muted-foreground w-[40px]">Tarea</span>
                          <span className="text-[10px] font-medium flex-1 truncate">{m.task || '—'}</span>
                        </div>
                        {/* Status */}
                        <div className="flex items-center gap-2 px-4 py-1.5" style={{ borderTop: '1px solid hsl(var(--border))', marginLeft: 16 }}>
                          <span className="text-[9px] font-bold uppercase text-muted-foreground w-[40px]">Estado</span>
                          <span
                            className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase"
                            style={{
                              background: m.status === 'activa' ? '#dcfce7' : m.status === 'averia' ? '#fee2e2' : '#fef9c3',
                              color: m.status === 'activa' ? '#166534' : m.status === 'averia' ? '#991b1b' : '#854d0e',
                            }}
                          >
                            {m.status === 'activa' ? 'Activa' : m.status === 'averia' ? 'Avería' : 'Parada'}
                          </span>
                          <span className="text-[10px] font-mono font-bold ml-auto">{m.hoursToday > 0 ? `${m.hoursToday.toFixed(1)}h` : '—'}</span>
                        </div>
                        {/* Operators */}
                        {operatorWorkers.length > 0 ? (
                          operatorWorkers.map(w => {
                            const ts = TIPO_STYLES[w.tipo];
                            return (
                              <div
                                key={w.id}
                                className="flex items-center gap-2 px-4 py-1.5"
                                style={{ borderTop: '1px solid hsl(var(--border))', marginLeft: 16 }}
                              >
                                <span className="text-[9px] font-bold uppercase text-muted-foreground w-[40px]">Oper.</span>
                                <span className="text-[10px] font-medium flex-1 truncate">{w.name}</span>
                                <span
                                  className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase"
                                  style={{ background: ts.bg, color: ts.color }}
                                >
                                  {ts.label}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-1.5" style={{ borderTop: '1px solid hsl(var(--border))', marginLeft: 16 }}>
                            <span className="text-[9px] font-bold uppercase text-muted-foreground w-[40px]">Oper.</span>
                            <span className="text-[10px] text-muted-foreground">Sin operario asignado</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* TOTAL row */}
              <div
                className="grid gap-0 items-center"
                style={{
                  gridTemplateColumns: 'minmax(0, 2fr) 50px 50px',
                  borderTop: '2px solid hsl(var(--g2))',
                  background: 'hsl(var(--g05))',
                }}
              >
                <div className="px-2 py-2 text-[10px] font-bold uppercase">{catActive.length} activas de {catMachines.length}</div>
                <div className="px-1 py-2"></div>
                <div className="px-1 py-2 text-[10px] font-mono text-center font-bold">{totalHH.toFixed(1)}</div>
              </div>
            </div>
          );
        })}

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
            <SignatureCanvas label="Capataz" subtitle={projectInfo.foreman} />
            <SignatureCanvas label="Jefe de Obra" subtitle="Firma pendiente" />
          </div>
        </div>
      </div>

      <button className="sbtn" onClick={handleSend} disabled={submitted}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        {submitted ? 'Parte enviado ✓' : 'Enviar parte al jefe de obra'}
      </button>

      {submitted && (
        <button
          className="w-full py-3 rounded-xl border-none text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2 mt-2"
          style={{ background: '#0f1f3a', color: '#fff' }}
          onClick={handleDownloadPdf}
        >
          📄 Descargar PDF del parte
        </button>
      )}
    </>
  );
};

export default EnviarScreen;
