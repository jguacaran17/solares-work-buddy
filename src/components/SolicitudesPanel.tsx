import { useState } from "react";
import { TransferRequest, TransferStatus, mockActivities } from "@/lib/mock-data";
import { toast } from "sonner";
import { X } from "lucide-react";

export interface OutgoingRequest {
  id: string;
  workerName: string;
  toZone: string;
  toActivity: string;
  requestedAt: string;
  status: TransferStatus;
}

interface SolicitudesPanelProps {
  transfers: TransferRequest[];
  onUpdateStatus: (id: string, status: TransferStatus) => void;
  compact?: boolean;
  outgoingRequests?: OutgoingRequest[];
  onAddOutgoing?: (req: OutgoingRequest) => void;
}

const statusStyles: Record<TransferStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Aprobado' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rechazado' },
};

const initialOutgoing: OutgoingRequest[] = [
  { id: 'out1', workerName: 'Pedro Ruiz', toZone: 'Zona B · Estructura', toActivity: 'Estructura', requestedAt: '08:45', status: 'pending' },
];

// Foremen from other zones with their available workers
const otherForemen = [
  {
    id: 'f1',
    name: 'Mario Ruiz',
    zone: 'Zona C',
    activity: 'Módulos',
    label: 'Mario Ruiz · Zona C (Módulos)',
    workers: [
      { id: 'ext1', name: 'Álvaro Sánchez', avatar: 'AS', task: 'Montaje módulos' },
      { id: 'ext2', name: 'Tomás Herrera', avatar: 'TH', task: 'Cableado módulos' },
      { id: 'ext3', name: 'Raúl Méndez', avatar: 'RM', task: 'Revisión módulos' },
    ],
  },
  {
    id: 'f2',
    name: 'Luis Fernández',
    zone: 'Zona B',
    activity: 'Estructura',
    label: 'Luis Fernández · Zona B (Estructura)',
    workers: [
      { id: 'ext4', name: 'Iván Delgado', avatar: 'ID', task: 'Soldadura perfiles' },
      { id: 'ext5', name: 'Sergio Navarro', avatar: 'SN', task: 'Montaje perfiles' },
    ],
  },
  {
    id: 'f3',
    name: 'Pablo Castro',
    zone: 'Zona D',
    activity: 'Cableado',
    label: 'Pablo Castro · Zona D (Cableado)',
    workers: [
      { id: 'ext6', name: 'Marcos Peña', avatar: 'MP', task: 'Tirada cable BT' },
      { id: 'ext7', name: 'Óscar Rivas', avatar: 'OR', task: 'Conexionado cajas' },
      { id: 'ext8', name: 'Adrián Vega', avatar: 'AV', task: 'Etiquetado bandejas' },
    ],
  },
];

const TransferCard = ({ t, onUpdateStatus }: { t: TransferRequest; onUpdateStatus: (id: string, status: TransferStatus) => void }) => {
  const st = statusStyles[t.status];
  return (
    <div className="rounded-lg border border-border overflow-hidden" style={{ background: 'hsl(var(--card))' }}>
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-bold">{t.workerName}</span>
          <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ background: st.bg, color: st.color }}>{st.label}</span>
        </div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div><span className="font-semibold">De:</span> {t.fromZone} → {t.fromActivity}</div>
          <div><span className="font-semibold">A:</span> {t.toZone} → {t.toActivity}</div>
          <div><span className="font-semibold">Solicita:</span> {t.requestedBy} a las {t.requestedAt}</div>
          <div className="font-mono font-bold mt-0.5" style={{ color: 'hsl(var(--g8))' }}>{t.hoursBeforeTransfer}h antes · {t.hoursAfterTransfer}h después</div>
        </div>
        {t.status === 'pending' && (
          <div className="flex gap-2 mt-2">
            <button className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer" style={{ background: '#0f1f3a', color: '#fff' }} onClick={() => onUpdateStatus(t.id, 'approved')}>✓ Aprobar</button>
            <button className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-border cursor-pointer" style={{ background: 'hsl(var(--card))', color: 'hsl(var(--destructive))' }} onClick={() => onUpdateStatus(t.id, 'rejected')}>✕ Rechazar</button>
          </div>
        )}
      </div>
    </div>
  );
};

const SolicitudesPanel = ({ transfers, onUpdateStatus, compact, outgoingRequests, onAddOutgoing }: SolicitudesPanelProps) => {
  const outgoing = outgoingRequests ?? initialOutgoing;
  const [showModal, setShowModal] = useState(false);
  const [selectedForeman, setSelectedForeman] = useState("");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [motivo, setMotivo] = useState("");

  const pending = transfers.filter(t => t.status === 'pending');
  const resolved = transfers.filter(t => t.status !== 'pending');

  const resetModal = () => {
    setSelectedForeman("");
    setSelectedWorkerIds([]);
    setSelectedTask("");
    setMotivo("");
  };

  const handleOpenModal = () => {
    resetModal();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = () => {
    if (!selectedForeman || selectedWorkerIds.length === 0 || !selectedTask) {
      toast.error("Selecciona capataz, al menos un operario y una tarea");
      return;
    }
    const foreman = otherForemen.find(f => f.id === selectedForeman);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    selectedWorkerIds.forEach(wid => {
      const worker = foreman?.workers.find(w => w.id === wid);
      if (worker && onAddOutgoing) {
        onAddOutgoing({
          id: `out-${Date.now()}-${wid}`,
          workerName: worker.name,
          toZone: `${foreman!.zone} · ${foreman!.activity}`,
          toActivity: selectedTask,
          requestedAt: timeStr,
          status: 'pending',
        });
      }
    });
    const workerNames = selectedWorkerIds
      .map(wid => foreman?.workers.find(w => w.id === wid)?.name)
      .filter(Boolean)
      .join(", ");
    toast.success(`Solicitud enviada: ${workerNames} para ${selectedTask}`);
    setShowModal(false);
  };

  const toggleWorker = (wid: string) => {
    setSelectedWorkerIds(prev =>
      prev.includes(wid) ? prev.filter(id => id !== wid) : [...prev, wid]
    );
  };

  const currentForeman = otherForemen.find(f => f.id === selectedForeman);

  // ── BELL DROPDOWN: incoming only ──
  if (compact) {
    return (
      <div className="space-y-2 p-3">
        {pending.length === 0 ? (
          <div className="text-[13px] text-muted-foreground text-center py-3">Sin solicitudes pendientes</div>
        ) : (
          <>
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Solicitudes recibidas ({pending.length})</div>
            {pending.map(t => <TransferCard key={t.id} t={t} onUpdateStatus={onUpdateStatus} />)}
          </>
        )}
      </div>
    );
  }

  // ── FULL TAB ──
  const totalPending = pending.length;
  const totalResolved = resolved.length;

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3" style={{ marginTop: 4 }}>
        <div className="stat-card">
          <div className="kmi-label">Pendientes</div>
          <div className="kmi-value text-warning">{totalPending}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Enviadas</div>
          <div className="kmi-value" style={{ color: 'hsl(var(--g6))' }}>{outgoing.length}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Resueltas</div>
          <div className="kmi-value text-success">{totalResolved}</div>
        </div>
      </div>

      {/* New request button */}
      <button
        onClick={handleOpenModal}
        className="w-full py-3 rounded-xl text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 mb-4 border-none"
        style={{ background: '#0f1f3a', color: '#fff' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva solicitud de operario
      </button>

      {/* SOLICITUDES RECIBIDAS */}
      <div className="sec-title">Solicitudes recibidas</div>
      {transfers.length === 0 ? (
        <div className="glass-card rounded-[10px] p-4 text-center text-[12px] text-muted-foreground mb-4">Sin solicitudes recibidas</div>
      ) : (
        <div className="space-y-2 mb-4">
          {pending.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Pendientes · {pending.length}</div>
              {pending.map(t => <TransferCard key={t.id} t={t} onUpdateStatus={onUpdateStatus} />)}
            </>
          )}
          {resolved.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-muted-foreground uppercase mt-3 mb-1">Resueltas · {resolved.length}</div>
              {resolved.map(t => <TransferCard key={t.id} t={t} onUpdateStatus={onUpdateStatus} />)}
            </>
          )}
        </div>
      )}

      {/* MIS SOLICITUDES ENVIADAS */}
      <div className="sec-title">Mis solicitudes enviadas</div>
      {outgoing.length === 0 ? (
        <div className="glass-card rounded-[10px] p-4 text-center text-[12px] text-muted-foreground">Sin solicitudes enviadas</div>
      ) : (
        <div className="space-y-2">
          {outgoing.map(o => {
            const st = statusStyles[o.status];
            return (
              <div key={o.id} className="rounded-lg border border-border overflow-hidden" style={{ background: 'hsl(var(--card))' }}>
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold">{o.workerName}</span>
                    <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    <div><span className="font-semibold">Destino:</span> {o.toZone} → {o.toActivity}</div>
                    <div><span className="font-semibold">Enviada:</span> {o.requestedAt}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BOTTOM SHEET MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={handleCloseModal}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Sheet */}
          <div
            className="relative w-full max-w-lg rounded-t-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
            style={{ background: 'hsl(var(--background))', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-[15px] font-bold">Solicitar operario externo</h3>
              <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-muted cursor-pointer border-none bg-transparent">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 130px)' }}>
              {/* Foreman select */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">Capataz de origen</label>
                <select
                  value={selectedForeman}
                  onChange={e => { setSelectedForeman(e.target.value); setSelectedWorkerIds([]); }}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-[13px] bg-card"
                >
                  <option value="">Seleccionar capataz...</option>
                  {otherForemen.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Worker cards */}
              {currentForeman && (
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">
                    Operarios disponibles · {currentForeman.zone}
                  </label>
                  <div className="space-y-1.5">
                    {currentForeman.workers.map(w => {
                      const selected = selectedWorkerIds.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          onClick={() => toggleWorker(w.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer text-left transition-all"
                          style={{
                            background: selected ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--card))',
                            borderColor: selected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: selected ? '#0f1f3a' : 'hsl(var(--g6))' }}
                          >
                            {w.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold">{w.name}</div>
                            <div className="text-[10px] text-muted-foreground">{w.task}</div>
                          </div>
                          {selected && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] flex-shrink-0" style={{ background: '#0f1f3a' }}>✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Task select */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">Para la tarea</label>
                <select
                  value={selectedTask}
                  onChange={e => setSelectedTask(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-[13px] bg-card"
                >
                  <option value="">Seleccionar tarea...</option>
                  {mockActivities.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">Motivo (opcional)</label>
                <input
                  type="text"
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Necesito refuerzo para el turno de tarde"
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-[13px] bg-card"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border">
              <button
                onClick={handleSubmit}
                disabled={!selectedForeman || selectedWorkerIds.length === 0 || !selectedTask}
                className="w-full py-3 rounded-xl text-[13px] font-bold border-none cursor-pointer"
                style={{
                  background: '#0f1f3a',
                  color: '#fff',
                  opacity: (!selectedForeman || selectedWorkerIds.length === 0 || !selectedTask) ? 0.5 : 1,
                }}
              >
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesPanel;
