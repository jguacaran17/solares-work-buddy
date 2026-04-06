import { TransferRequest, TransferStatus } from "@/lib/mock-data";

interface SolicitudesPanelProps {
  transfers: TransferRequest[];
  onUpdateStatus: (id: string, status: TransferStatus) => void;
  compact?: boolean; // true for bell dropdown
}

const statusStyles: Record<TransferStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Aprobado' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rechazado' },
};

const SolicitudesPanel = ({ transfers, onUpdateStatus, compact }: SolicitudesPanelProps) => {
  const pending = transfers.filter(t => t.status === 'pending');
  const resolved = transfers.filter(t => t.status !== 'pending');

  const renderCard = (t: TransferRequest) => {
    const st = statusStyles[t.status];
    return (
      <div
        key={t.id}
        className="rounded-lg border border-border overflow-hidden"
        style={{ background: 'hsl(var(--card))' }}
      >
        <div className="px-3 py-2.5">
          {/* Worker + status */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold">{t.workerName}</span>
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
              style={{ background: st.bg, color: st.color }}
            >
              {st.label}
            </span>
          </div>

          {/* Transfer details */}
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="font-semibold">De:</span>
              <span>{t.fromZone} → {t.fromActivity}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">A:</span>
              <span>{t.toZone} → {t.toActivity}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">Solicita:</span>
              <span>{t.requestedBy} a las {t.requestedAt}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold" style={{ color: 'hsl(var(--g8))' }}>
                {t.hoursBeforeTransfer}h antes · {t.hoursAfterTransfer}h después
              </span>
            </div>
          </div>

          {/* Actions */}
          {t.status === 'pending' && (
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer"
                style={{ background: '#0f1f3a', color: '#fff' }}
                onClick={() => onUpdateStatus(t.id, 'approved')}
              >
                ✓ Aprobar
              </button>
              <button
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-border cursor-pointer"
                style={{ background: 'hsl(var(--card))', color: 'hsl(var(--destructive))' }}
                onClick={() => onUpdateStatus(t.id, 'rejected')}
              >
                ✕ Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (compact) {
    // Bell dropdown mode
    return (
      <div className="space-y-2 p-3">
        {pending.length === 0 && resolved.length === 0 && (
          <div className="text-[13px] text-muted-foreground text-center py-3">Sin notificaciones nuevas</div>
        )}
        {pending.length > 0 && (
          <>
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Pendientes ({pending.length})</div>
            {pending.map(renderCard)}
          </>
        )}
        {resolved.length > 0 && (
          <>
            <div className="text-[10px] font-bold uppercase text-muted-foreground mt-2 mb-1">Resueltas</div>
            {resolved.map(renderCard)}
          </>
        )}
      </div>
    );
  }

  // Full Solicitudes tab
  return (
    <div>
      <div className="sec-title" style={{ marginTop: 4 }}>Solicitudes de traslado</div>

      {pending.length === 0 && resolved.length === 0 && (
        <div className="glass-card rounded-[10px] p-6 text-center">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm font-bold mb-1">Sin solicitudes</p>
          <p className="text-xs text-muted-foreground">No hay solicitudes de traslado pendientes.</p>
        </div>
      )}

      {pending.length > 0 && (
        <>
          <div className="text-[11px] font-bold text-muted-foreground uppercase mb-2">
            Pendientes · {pending.length}
          </div>
          <div className="space-y-2 mb-4">
            {pending.map(renderCard)}
          </div>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <div className="text-[11px] font-bold text-muted-foreground uppercase mb-2">
            Resueltas · {resolved.length}
          </div>
          <div className="space-y-2">
            {resolved.map(renderCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default SolicitudesPanel;
