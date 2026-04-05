import { useState } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface AppHeaderProps {
  notifications: number;
  activeStep?: number;
  headerSub?: string;
}

const historyData = Array.from({ length: 15 }, (_, i) => {
  const d = subDays(new Date(), i + 1);
  return {
    date: format(d, "dd/MM/yy"),
    dayOfWeek: format(d, "EEEE", { locale: es }),
    operarios: Math.floor(Math.random() * 5) + 5,
    horasTotales: parseFloat((Math.random() * 20 + 50).toFixed(1)),
    estado: 'Enviado' as const,
  };
});

const AppHeader = ({ notifications, activeStep, headerSub }: AppHeaderProps) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date();
  const todayFormatted = format(today, "dd/MM/yy");
  const todayDayOfWeek = format(today, "EEEE", { locale: es });

  const sub = headerSub || 'Pepe Cabrerizo · Capataz';

  return (
    <>
      {/* Status bar */}
      <div className="flex justify-between items-center px-[18px] py-2 pb-1 flex-shrink-0" style={{ background: 'hsl(var(--g8))' }}>
        <span className="text-[13px] font-semibold text-white font-mono">{format(today, "HH:mm")}</span>
        <span className="text-[11px] text-white/70">●●● WiFi 🔋87%</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 flex-shrink-0" style={{ background: 'hsl(var(--g8))' }}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[16px] font-bold text-white tracking-tight">
            Parte<span style={{ color: 'hsl(var(--g4))' }}>Digital</span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Bell */}
            <button className="relative cursor-pointer" onClick={() => setShowNotif(!showNotif)}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2" style={{ background: '#e53e3e', borderColor: 'hsl(var(--g8))' }}>
                  {notifications}
                </span>
              )}
            </button>
            {/* Avatar */}
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: 'hsl(var(--g7))', border: '2px solid hsl(var(--g4))' }}>
              PC
            </div>
          </div>
        </div>

        {/* Project box */}
        <div className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(255,255,255,.1)' }}>
          <div>
            <div className="text-[13px] font-semibold text-white">PSFV San Pedro</div>
            <div className="text-[11px] mt-px" style={{ color: 'hsl(var(--g2))' }}>{sub}</div>
          </div>
          <button onClick={() => setShowHistory(true)} className="text-right active:opacity-70 transition-opacity">
            <div className="text-[11px] font-mono" style={{ color: 'hsl(var(--g2))' }}>
              {todayFormatted}<br />
              <span className="capitalize">{todayDayOfWeek}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Notification panel */}
      {showNotif && (
        <div className="fixed inset-0 z-[999]" onClick={() => setShowNotif(false)}>
          <div
            className="absolute top-[110px] right-2.5 left-2.5 max-w-[410px] mx-auto rounded-[14px] overflow-hidden max-h-[70vh] flex flex-col"
            style={{ background: 'hsl(var(--card))', boxShadow: '0 8px 32px rgba(0,0,0,.22)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border" style={{ background: 'hsl(var(--g8))' }}>
              <div className="text-[14px] font-bold text-white">Notificaciones</div>
              <button onClick={() => setShowNotif(false)} className="text-white text-[12px] font-bold px-3 py-1 rounded-[20px]" style={{ background: 'rgba(255,255,255,.2)' }}>Cerrar</button>
            </div>
            <div className="p-3 text-center text-[13px] text-muted-foreground">Sin notificaciones nuevas</div>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setShowHistory(false)}>
          <div
            className="w-full max-w-[430px] rounded-t-[18px] p-5 pb-9 max-h-[88vh] overflow-y-auto"
            style={{ background: 'hsl(var(--card))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-sm mx-auto mb-4" style={{ background: 'hsl(var(--border))' }} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold">Historial – Últimos 15 días</h2>
              <button onClick={() => setShowHistory(false)} className="text-[12px] font-bold px-3.5 py-1.5 rounded-[20px]" style={{ background: 'hsl(var(--g05))', color: 'hsl(var(--g7))' }}>✕ Cerrar</button>
            </div>
            <div className="space-y-2">
              {historyData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between rounded-[10px] px-3.5 py-3 border border-border" style={{ background: 'hsl(var(--card))' }}>
                  <div>
                    <p className="text-[12px] font-bold">{entry.date}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{entry.dayOfWeek}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">{entry.operarios} op. · {entry.horasTotales}h</p>
                    <span className="pill pill-ok mt-0.5 inline-block">{entry.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;
