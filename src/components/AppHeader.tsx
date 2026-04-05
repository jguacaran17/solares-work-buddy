import { useState } from "react";
import { Bell, Calendar, X } from "lucide-react";
import { projectInfo } from "@/lib/mock-data";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface AppHeaderProps {
  notifications: number;
  activeStep?: number;
}

const stepLabels: Record<number, string> = {
  1: 'Paso 1 – Fichaje',
  2: 'Paso 2 – Asignaciones',
  3: 'Paso 3 – Horas',
  4: 'Paso 4 – Enviar',
};

const zones = ['Zona A', 'Zona B', 'Zona C', 'Zona A', 'Zona B', 'Zona A', 'Zona C', 'Zona A', 'Zona B', 'Zona A', 'Zona C', 'Zona B', 'Zona A', 'Zona A', 'Zona B'];

const historyData = Array.from({ length: 15 }, (_, i) => {
  const d = subDays(new Date(), i + 1);
  return {
    date: format(d, "dd/MM/yy"),
    dayOfWeek: format(d, "EEEE", { locale: es }),
    zone: zones[i],
    operarios: Math.floor(Math.random() * 5) + 5,
    horasTotales: parseFloat((Math.random() * 20 + 50).toFixed(1)),
    estado: 'Enviado' as const,
  };
});

const AppHeader = ({ notifications, activeStep = 1 }: AppHeaderProps) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date();
  const todayFormatted = format(today, "dd/MM/yy");
  const todayDayOfWeek = format(today, "EEEE", { locale: es });

  return (
    <header className="bg-secondary text-secondary-foreground px-4 pt-3 pb-4">
      {/* Status bar mock */}
      <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-3">
        <span>{format(today, "HH:mm")}</span>
        <div className="flex items-center gap-1">
          <span>●●●</span>
          <span>WiFi</span>
          <span>🔋87%</span>
        </div>
      </div>

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-lg font-bold tracking-tight text-white">Adapta</span>
          <span className="text-lg font-bold tracking-tight text-primary">Build</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-1.5"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          <div className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center text-[10px] font-bold bg-secondary">
            PC
          </div>
        </div>
      </div>

      {/* Project info card */}
      <div className="bg-accent/30 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold">{projectInfo.name}</h1>
          <p className="text-xs opacity-70">
            {stepLabels[activeStep] || 'Paso 1 – Fichaje'}
          </p>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="text-right flex items-center gap-1.5 active:opacity-70 transition-opacity"
        >
          <div>
            <p className="text-sm font-medium text-primary">{todayFormatted}</p>
            <p className="text-xs opacity-60 capitalize">{todayDayOfWeek}</p>
          </div>
          <Calendar className="w-4 h-4 text-primary opacity-70" />
        </button>
      </div>

      {/* Notification panel */}
      {showNotif && (
        <div className="mt-3 bg-accent rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Notificaciones</span>
            <button
              onClick={() => setShowNotif(false)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
          <p className="text-xs opacity-70">Sin notificaciones nuevas</p>
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
          <div
            className="bg-card text-card-foreground w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Historial – Últimos 15 días</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {historyData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{entry.date}</p>
                    <p className="text-xs text-muted-foreground capitalize">{entry.dayOfWeek}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p>{entry.zone} · {entry.operarios} op. · {entry.horasTotales}h</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: 'hsl(168 50% 47% / 0.15)', color: 'hsl(168 50% 30%)' }}
                    >
                      {entry.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
