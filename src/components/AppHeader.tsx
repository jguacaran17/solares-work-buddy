import { useState } from "react";
import { Bell } from "lucide-react";
import { projectInfo } from "@/lib/mock-data";

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

const AppHeader = ({ notifications, activeStep = 1 }: AppHeaderProps) => {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="bg-secondary text-secondary-foreground px-4 pt-3 pb-4">
      {/* Status bar mock */}
      <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-3">
        <span>07:52</span>
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
            Paso 1 – Fichaje
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-primary">{projectInfo.date}</p>
          <p className="text-xs opacity-60">{projectInfo.dayOfWeek}</p>
        </div>
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
    </header>
  );
};

export default AppHeader;
