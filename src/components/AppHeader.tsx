import { useState } from "react";
import { TransferRequest, TransferStatus } from "@/lib/mock-data";
import maracofLogo from "@/assets/logo_maracof.png";
import SolicitudesPanel from "@/components/SolicitudesPanel";
import { format, subDays, isToday as isTodayFn } from "date-fns";
import { es } from "date-fns/locale";

interface HistoryEntry {
  date: Date;
  dateStr: string;
  dayOfWeek: string;
  operarios: number;
  horasTotales: number;
  estado: string;
  isToday: boolean;
}

const generateHistory = (): HistoryEntry[] => {
  return Array.from({ length: 15 }, (_, i) => {
    const d = subDays(new Date(), i);
    const today = isTodayFn(d);
    return {
      date: d,
      dateStr: format(d, "dd/MM/yy"),
      dayOfWeek: format(d, "EEEE", { locale: es }),
      operarios: today ? 0 : Math.floor(Math.random() * 5) + 5,
      horasTotales: today ? 0 : parseFloat((Math.random() * 20 + 50).toFixed(1)),
      estado: today ? 'En curso' : 'Enviado',
      isToday: today,
    };
  });
};

const historyData = generateHistory();

interface AppHeaderProps {
  notifications: number;
  activeStep?: number;
  headerSub?: string;
  selectedDate?: Date;
  onSelectDate?: (date: Date, isToday: boolean) => void;
  transfers?: TransferRequest[];
  onUpdateTransferStatus?: (id: string, status: TransferStatus) => void;
}

const AppHeader = ({ notifications, activeStep, headerSub, selectedDate, onSelectDate, transfers, onUpdateTransferStatus }: AppHeaderProps) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date();
  const current = selectedDate || today;
  const currentFormatted = format(current, "dd/MM/yy");
  const currentDayOfWeek = format(current, "EEEE", { locale: es });
  const viewingToday = isTodayFn(current);

  const sub = headerSub || 'Pepe Cabrerizo · Capataz';

  const handleSelectDate = (entry: HistoryEntry) => {
    onSelectDate?.(entry.date, entry.isToday);
    setShowHistory(false);
  };

  return (
    <>
      {/* Status bar */}
      <div className="flex justify-between items-center px-[18px] py-2 pb-1 flex-shrink-0" style={{ background: 'hsl(var(--navy))' }}>
        <span className="text-[13px] font-semibold text-white font-mono">{format(today, "HH:mm")}</span>
        <span className="text-[11px] text-white/70">●●● WiFi 🔋87%</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 flex-shrink-0" style={{ background: 'hsl(var(--navy))' }}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[16px] font-bold tracking-tight">
            <span className="text-white">Adapta</span>
            <span style={{ color: 'hsl(var(--teal))' }}> Build</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="relative cursor-pointer" onClick={() => setShowNotif(!showNotif)}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,.1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2" style={{ background: '#e53e3e', borderColor: 'hsl(var(--navy))' }}>
                  {notifications}
                </span>
              )}
            </button>
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: 'hsl(var(--navy-light))', border: '2px solid hsl(var(--teal))' }}>
              PC
            </div>
          </div>
        </div>

        {/* Project box */}
        <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div className="flex items-center gap-2">
            <img src={maracofLogo} alt="Maracof" className="h-[22px] w-auto rounded-sm" />
            <div>
              <div className="text-[13px] font-semibold text-white">PSFV San Pedro</div>
              <div className="text-[11px] mt-px" style={{ color: 'hsl(var(--teal-pale))' }}>{sub}</div>
            </div>
          <button onClick={() => setShowHistory(true)} className="text-right active:opacity-70 transition-opacity">
            <div className="text-[11px] font-mono" style={{ color: 'hsl(var(--teal-pale))' }}>
              {currentFormatted}<br />
              <span className="capitalize">{currentDayOfWeek}</span>
            </div>
            {!viewingToday && (
              <div className="text-[9px] mt-0.5 font-semibold" style={{ color: '#f6ad55' }}>🔒 Solo lectura</div>
            )}
          </button>
        </div>
      </div>

      {/* Notification panel */}
      {showNotif && (
        <div className="fixed inset-0 z-[999]" onClick={() => setShowNotif(false)}>
          <div
            className="absolute top-[110px] right-2.5 left-2.5 max-w-[410px] mx-auto rounded-2xl overflow-hidden max-h-[70vh] flex flex-col"
            style={{ background: 'hsl(var(--card))', boxShadow: '0 8px 32px rgba(0,0,0,.22)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border" style={{ background: 'hsl(var(--navy))' }}>
              <div className="text-[14px] font-bold text-white">Notificaciones</div>
              <button onClick={() => setShowNotif(false)} className="text-white text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.15)' }}>Cerrar</button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
              {transfers && onUpdateTransferStatus ? (
                <SolicitudesPanel transfers={transfers} onUpdateStatus={onUpdateTransferStatus} compact />
              ) : (
                <div className="p-3 text-center text-[13px] text-muted-foreground">Sin notificaciones nuevas</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setShowHistory(false)}>
          <div
            className="w-full max-w-[430px] rounded-t-2xl p-5 pb-9 max-h-[88vh] overflow-y-auto"
            style={{ background: 'hsl(var(--card))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-sm mx-auto mb-4" style={{ background: 'hsl(var(--border))' }} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold">Historial – Últimos 15 días</h2>
              <button onClick={() => setShowHistory(false)} className="text-[12px] font-bold px-3.5 py-1.5 rounded-full" style={{ background: 'hsl(var(--teal-bg))', color: 'hsl(var(--navy-light))' }}>✕ Cerrar</button>
            </div>
            <div className="space-y-2">
              {historyData.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectDate(entry)}
                  className="w-full flex items-center justify-between rounded-2xl px-3.5 py-3 border transition-all text-left"
                  style={{
                    background: entry.dateStr === currentFormatted ? 'hsl(var(--navy))' : 'hsl(var(--card))',
                    borderColor: entry.dateStr === currentFormatted ? 'hsl(var(--teal))' : 'hsl(var(--border))',
                    color: entry.dateStr === currentFormatted ? '#fff' : 'inherit',
                  }}
                >
                  <div>
                    <p className="text-[12px] font-bold">{entry.dateStr}</p>
                    <p className="text-[10px] capitalize" style={{ opacity: 0.7 }}>{entry.dayOfWeek}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px]" style={{ opacity: 0.7 }}>{entry.operarios} op. · {entry.horasTotales}h</p>
                    <span className={`pill ${entry.isToday ? 'pill-warn' : 'pill-ok'} mt-0.5 inline-block`}>
                      {entry.estado}
                    </span>
                    {!entry.isToday && (
                      <span className="text-[9px] ml-1.5" style={{ opacity: 0.5 }}>🔒</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;
