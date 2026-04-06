import { useState, useEffect, useRef, useCallback } from "react";
import { mockWorkers, Machine } from "@/lib/mock-data";
import { toast } from "sonner";
import jsPDF from "jspdf";

export interface Incident {
  id: string;
  machineName: string;
  category: 'maquinaria' | 'flota';
  type: 'Avería' | 'Parada';
  description: string;
  horaParada: string;
  estimadoReparacion: string;
  reportedAt: string;
  status: 'activa' | 'resuelta';
  signatureDataUrl?: string;
}

interface MaquinariaScreenProps {
  machines: Machine[];
  onUpdateMachines: (machines: Machine[]) => void;
  preFill?: { name: string; tab: 'maquinaria' | 'flota' } | null;
  onClearPreFill?: () => void;
  incidents: Incident[];
  onUpdateIncidents: (incidents: Incident[]) => void;
}

// ── Signature Canvas ──
const SignaturePad = ({ onSignatureChange }: { onSignatureChange: (dataUrl: string | null) => void }) => {
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

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    if (hasSignature && canvasRef.current) {
      onSignatureChange(canvasRef.current.toDataURL('image/png'));
    }
  }, [hasSignature, onSignatureChange]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(null);
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
    <div>
      <div className="text-[11px] font-bold mb-1">Firma del capataz</div>
      <canvas
        ref={canvasRef}
        className="w-full border border-border rounded-md mb-1 bg-white cursor-crosshair"
        style={{ height: 80, touchAction: 'none' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
      {hasSignature && (
        <button className="text-[9px] font-bold px-2 py-0.5 rounded border border-border text-destructive mb-2" onClick={clearCanvas}>Borrar firma</button>
      )}
    </div>
  );
};

const MaquinariaScreen = ({ machines, onUpdateMachines, preFill, onClearPreFill, incidents, onUpdateIncidents }: MaquinariaScreenProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab] = useState<'maquinaria' | 'flota'>('maquinaria');
  const [formMachineName, setFormMachineName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'Avería' | 'Parada'>('Avería');
  const [formEstimado, setFormEstimado] = useState('2h');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [lastReportedId, setLastReportedId] = useState<string | null>(null);

  useEffect(() => {
    if (preFill) {
      setFormTab(preFill.tab);
      setFormMachineName(preFill.name);
      setShowForm(true);
      onClearPreFill?.();
    }
  }, [preFill]);

  const activeIncidents = incidents.filter(i => i.status === 'activa');

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0 ? 'Sin asignar' : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(', ');

  const resolveIncident = (incidentId: string) => {
    onUpdateIncidents(incidents.map(i => i.id === incidentId ? { ...i, status: 'resuelta' as const } : i));
    toast.success('Incidencia resuelta');
  };

  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSubmitIncidencia = () => {
    if (!formMachineName) { toast.error('Selecciona una máquina'); return; }

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      machineName: formMachineName,
      category: formTab,
      type: formType,
      description: formDescription || 'Sin descripción',
      horaParada: now(),
      estimadoReparacion: formEstimado,
      reportedAt: now(),
      status: 'activa',
      signatureDataUrl: signatureDataUrl || undefined,
    };

    onUpdateIncidents([newIncident, ...incidents]);

    // Also update machine status
    const found = machines.find(m => m.name === formMachineName);
    if (found) {
      onUpdateMachines(machines.map(m => m.id === found.id ? { ...m, status: 'averia' as const, hoursToday: 0 } : m));
    }

    toast.success('Incidencia reportada y jefe de obra notificado');
    setLastReportedId(newIncident.id);
    setShowForm(false);
    setFormMachineName('');
    setFormDescription('');
    setSignatureDataUrl(null);
  };

  const downloadIncidentPdf = (inc: Incident) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFillColor(15, 31, 58);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('INFORME DE INCIDENCIA', 15, 18);
    doc.setFontSize(10);
    doc.text('PSFV San Pedro · Adapta Build', 15, 27);

    doc.setTextColor(0, 0, 0);
    let y = 45;
    const row = (label: string, value: string) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, y);
      y += 7;
    };

    row('Equipo:', inc.machineName);
    row('Categoría:', inc.category === 'maquinaria' ? 'Maquinaria' : 'Flota');
    row('Tipo:', inc.type);
    row('Hora parada:', inc.horaParada);
    row('Estimado reparación:', inc.estimadoReparacion);
    row('Descripción:', inc.description);
    row('Capataz:', 'Pepe Cabrerizo');

    if (inc.signatureDataUrl) {
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Firma del capataz:', 15, y);
      y += 3;
      try { doc.addImage(inc.signatureDataUrl, 'PNG', 15, y, 60, 25); } catch {}
    }

    doc.save(`incidencia_${inc.machineName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <>
      <div className="sec-title" style={{ marginTop: 4 }}>Incidencias activas</div>

      <div className="grid grid-cols-1 gap-2 mb-3" style={{ maxWidth: 120 }}>
        <div className="stat-card text-center py-2">
          <div className="text-[18px] font-bold text-destructive">{activeIncidents.length}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Activas</div>
        </div>
      </div>

      {/* Report button */}
      <button
        onClick={() => { setShowForm(true); setLastReportedId(null); }}
        className="w-full py-2.5 rounded-lg text-[12px] font-bold border-none cursor-pointer mb-3 flex items-center justify-center gap-1.5"
        style={{ background: 'hsl(var(--red-bg))', color: 'hsl(var(--destructive))', border: '1px solid #fca5a5' }}
      >
        ⚠ Reportar nueva incidencia
      </button>

      {/* Last reported PDF download */}
      {lastReportedId && (() => {
        const inc = incidents.find(i => i.id === lastReportedId);
        if (!inc) return null;
        return (
          <button
            onClick={() => downloadIncidentPdf(inc)}
            className="w-full py-2.5 rounded-lg text-[12px] font-bold border-none cursor-pointer mb-3 flex items-center justify-center gap-1.5"
            style={{ background: '#0f1f3a', color: '#fff' }}
          >
            📄 Descargar PDF incidencia — {inc.machineName}
          </button>
        );
      })()}

      {/* Incidencia form */}
      {showForm && (
        <div className="glass-card rounded-[10px] p-3.5 mb-3">
          <div className="text-[12px] font-bold mb-2">Nueva incidencia</div>
          <div className="flex gap-1.5 mb-2">
            {(['maquinaria', 'flota'] as const).map(tab => (
              <button key={tab} onClick={() => setFormTab(tab)}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold border-none cursor-pointer"
                style={{ background: formTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--g1))', color: formTab === tab ? '#fff' : 'hsl(var(--g6))' }}>
                {tab === 'maquinaria' ? 'Maquinaria' : 'Flota'}
              </button>
            ))}
          </div>
          <select value={formMachineName} onChange={e => setFormMachineName(e.target.value)}
            className="w-full border border-border rounded-md px-2.5 py-2 text-[12px] mb-2" style={{ background: 'hsl(var(--background))' }}>
            <option value="">Seleccionar {formTab === 'maquinaria' ? 'máquina' : 'vehículo'}...</option>
            {machines.filter(m => m.category === formTab).map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          <div className="flex gap-1.5 mb-2">
            {(['Avería', 'Parada'] as const).map(t => (
              <button key={t} onClick={() => setFormType(t)}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold border-none cursor-pointer"
                style={{ background: formType === t ? (t === 'Avería' ? '#fee2e2' : '#fef9c3') : 'hsl(var(--g1))', color: formType === t ? (t === 'Avería' ? '#991b1b' : '#854d0e') : 'hsl(var(--g6))' }}>
                {t}
              </button>
            ))}
          </div>
          <select value={formEstimado} onChange={e => setFormEstimado(e.target.value)}
            className="w-full border border-border rounded-md px-2.5 py-2 text-[12px] mb-2" style={{ background: 'hsl(var(--background))' }}>
            <option value="1h">Estimado: 1h</option>
            <option value="2h">Estimado: 2h</option>
            <option value="4h">Estimado: 4h</option>
            <option value="8h">Estimado: 8h (jornada)</option>
            <option value="+24h">Estimado: +24h</option>
          </select>
          <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)}
            placeholder="Descripción de la avería..." className="w-full min-h-[50px] border border-border rounded-md px-2.5 py-2 text-[11px] resize-none mb-2"
            style={{ background: 'hsl(var(--background))' }} />

          <SignaturePad onSignatureChange={setSignatureDataUrl} />

          <div className="flex gap-2 mt-2">
            <button onClick={handleSubmitIncidencia}
              className="flex-1 py-2 rounded-lg text-[11px] font-bold border-none cursor-pointer"
              style={{ background: 'hsl(var(--destructive))', color: '#fff' }}>
              Reportar → Notificar jefe de obra
            </button>
            <button onClick={() => { setShowForm(false); setFormMachineName(''); setFormDescription(''); }}
              className="px-4 py-2 rounded-lg text-[11px] font-bold border border-border cursor-pointer"
              style={{ background: 'hsl(var(--background))' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Active incidents list */}
      {activeIncidents.length === 0 ? (
        <div className="glass-card rounded-[10px] p-6 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-bold mb-1">Sin incidencias activas</p>
          <p className="text-xs text-muted-foreground">Ninguna máquina o vehículo tiene avería reportada.</p>
        </div>
      ) : (
        <div className="glass-card rounded-[10px] overflow-hidden">
          {activeIncidents.map((inc) => (
            <div key={inc.id} style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--red-bg))' }}>
              <div className="px-3.5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[13px] font-bold" style={{ color: 'hsl(var(--destructive))' }}>
                    {inc.machineName}
                  </div>
                  <span className="pill pill-danger">{inc.type}</span>
                </div>
                <div className="flex gap-1.5 mb-1.5 flex-wrap text-[10px]">
                  <span className="rounded px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,.6)', border: '1px solid hsl(var(--border))' }}>
                    {inc.category === 'maquinaria' ? '🔧 Maquinaria' : '🚗 Flota'}
                  </span>
                  <span className="rounded px-1.5 py-0.5 font-mono" style={{ background: 'rgba(255,255,255,.6)', border: '1px solid hsl(var(--border))' }}>
                    ⏱ {inc.horaParada}
                  </span>
                  <span className="rounded px-1.5 py-0.5 font-mono" style={{ background: 'rgba(255,255,255,.6)', border: '1px solid hsl(var(--border))' }}>
                    Est. {inc.estimadoReparacion}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-2">{inc.description}</div>
                <div className="flex gap-2">
                  <button onClick={() => resolveIncident(inc.id)}
                    className="flex-1 py-2 rounded-[7px] border-none text-[11px] font-bold cursor-pointer"
                    style={{ background: 'hsl(var(--g8))', color: '#fff' }}>
                    Marcar como resuelta
                  </button>
                  <button onClick={() => downloadIncidentPdf(inc)}
                    className="px-3 py-2 rounded-[7px] border-none text-[11px] font-bold cursor-pointer"
                    style={{ background: '#0f1f3a', color: '#fff' }}>
                    📄 PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved incidents */}
      {incidents.filter(i => i.status === 'resuelta').length > 0 && (
        <>
          <div className="sec-title mt-3">Resueltas</div>
          <div className="glass-card rounded-[10px] overflow-hidden">
            {incidents.filter(i => i.status === 'resuelta').map(inc => (
              <div key={inc.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-bold">{inc.machineName}</div>
                    <div className="text-[10px] text-muted-foreground">{inc.type} · {inc.horaParada} · {inc.description}</div>
                  </div>
                  <span className="pill pill-ok">Resuelta</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default MaquinariaScreen;
