import { useState } from "react";
import { TransferRequest, TransferStatus, mockWorkers, mockActivities } from "@/lib/mock-data";

interface SolicitudesPanelProps {
  transfers: TransferRequest[];
  onUpdateStatus: (id: string, status: TransferStatus) => void;
  compact?: boolean; // true for bell dropdown (incoming only)
}

const statusStyles: Record<TransferStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
  approved: { bg: '#dcfce7', color: '#166534', label: 'Aprobado' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rechazado' },
};

// Mock outgoing requests (sent by this foreman to other foremen)
const mockOutgoing: { id: string; workerName: string; toZone: string; toActivity: string; requestedAt: string; status: TransferStatus }[] = [
  { id: 'out1', workerName: 'Pedro Ruiz', toZone: 'Zona B · Estructura', toActivity: 'Estructura', requestedAt: '08:45', status: 'pending' },
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

const SolicitudesPanel = ({ transfers, onUpdateStatus, compact }: SolicitudesPanelProps) => {
  const pending = transfers.filter(t => t.status === 'pending');
  const resolved = transfers.filter(t => t.status !== 'pending');

  // ── BELL DROPDOWN: incoming requests only ──
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

  // ── FULL SOLICITUDES TAB ──
  const totalIncoming = transfers.length;
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
          <div className="kmi-value" style={{ color: 'hsl(var(--g6))' }}>{mockOutgoing.length}</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Resueltas</div>
          <div className="kmi-value text-success">{totalResolved}</div>
        </div>
      </div>

      {/* New request button */}
      <button
        className="w-full py-3 rounded-xl text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 mb-4 border-none"
        style={{ background: '#0f1f3a', color: '#fff' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva solicitud de operario
      </button>

      {/* SOLICITUDES RECIBIDAS */}
      <div className="sec-title">Solicitudes recibidas</div>
      {totalIncoming === 0 ? (
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
      {mockOutgoing.length === 0 ? (
        <div className="glass-card rounded-[10px] p-4 text-center text-[12px] text-muted-foreground">Sin solicitudes enviadas</div>
      ) : (
        <div className="space-y-2">
          {mockOutgoing.map(o => {
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
    </div>
  );
};

export default SolicitudesPanel;
