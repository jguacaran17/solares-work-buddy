import { useState } from "react";
import { mockWorkers, mockTimeEntries } from "@/lib/mock-data";
import { Clock, Play, Pause, Square, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const HoursScreen = () => {
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  const getEntry = (workerId: string) =>
    mockTimeEntries.find((e) => e.workerId === workerId);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div className="mb-5">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Fichaje de horas
        </p>
        <h2 className="text-xl font-bold mt-1">Control horario</h2>
      </div>

      <div className="space-y-2">
        {mockWorkers.map((worker) => {
          const entry = getEntry(worker.id);
          const isExpanded = selectedWorker === worker.id;
          const isWorking = worker.status === 'working';
          const isOnBreak = worker.status === 'break';

          return (
            <div key={worker.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setSelectedWorker(isExpanded ? null : worker.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {worker.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{worker.name}</p>
                  <p className="text-xs text-muted-foreground">{worker.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-bold">{worker.hoursToday}h</span>
                  </div>
                  {entry && (
                    <p className="text-[10px] text-muted-foreground">
                      Entrada: {entry.clockIn}
                    </p>
                  )}
                </div>
              </button>

              {isExpanded && entry && (
                <div className="px-3 pb-3 pt-1 border-t border-border">
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-background rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground">Entrada</p>
                      <p className="text-sm font-bold">{entry.clockIn}</p>
                    </div>
                    <div className="bg-background rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground">Salida</p>
                      <p className="text-sm font-bold">{entry.clockOut || '--:--'}</p>
                    </div>
                    <div className="bg-background rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground">Descanso</p>
                      <p className="text-sm font-bold">{entry.breakMinutes}m</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    Zona: <span className="font-medium text-foreground">{entry.zone}</span>
                  </p>

                  <div className="flex gap-2">
                    {isWorking && (
                      <>
                        <Button size="sm" variant="secondary" className="flex-1 h-9 text-xs">
                          <Coffee className="w-3.5 h-3.5 mr-1" /> Descanso
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 h-9 text-xs">
                          <Square className="w-3.5 h-3.5 mr-1" /> Fin jornada
                        </Button>
                      </>
                    )}
                    {isOnBreak && (
                      <Button size="sm" className="flex-1 h-9 text-xs">
                        <Play className="w-3.5 h-3.5 mr-1" /> Reanudar
                      </Button>
                    )}
                    {worker.status === 'off' && (
                      <p className="text-xs text-muted-foreground text-center w-full py-1">
                        Jornada finalizada a las {entry.clockOut}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HoursScreen;
