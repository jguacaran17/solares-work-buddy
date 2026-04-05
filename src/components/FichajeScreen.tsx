import { useState } from "react";
import { Check, X } from "lucide-react";
import { mockWorkers, mockZones, Worker } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";

interface FichajeScreenProps {
  workers: Worker[];
  onUpdateWorkers: (workers: Worker[]) => void;
  onNext: () => void;
}

const FichajeScreen = ({ workers, onUpdateWorkers, onNext }: FichajeScreenProps) => {
  const [generalTime, setGeneralTime] = useState("07:00");
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const presentes = workers.filter(w => w.status === 'presente').length;
  const faltas = workers.filter(w => w.status === 'falta').length;
  const sinFichar = workers.filter(w => w.status === 'sin-fichar').length;
  const total = workers.length;
  const progress = total > 0 ? Math.round(((presentes + faltas) / total) * 100) : 0;

  const setAllStatus = (status: 'presente' | 'falta') => {
    const updated = workers.map(w => ({
      ...w,
      status,
      clockIn: status === 'presente' ? generalTime : undefined,
    }));
    onUpdateWorkers(updated);
  };

  const setWorkerStatus = (workerId: string, status: 'presente' | 'falta') => {
    const updated = workers.map(w =>
      w.id === workerId
        ? { ...w, status, clockIn: status === 'presente' ? generalTime : undefined }
        : w
    );
    onUpdateWorkers(updated);
  };

  const getZoneWorkers = (zone: typeof mockZones[0]) =>
    workers.filter(w => zone.workers.includes(w.id));

  const getZoneFichados = (zone: typeof mockZones[0]) =>
    getZoneWorkers(zone).filter(w => w.status !== 'sin-fichar').length;

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="stat-card">
          <p className="text-lg font-bold text-success">{presentes}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Presentes</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold text-destructive">{faltas}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Faltas</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold text-warning">{sinFichar}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Sin fichar</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">Progreso fichaje</span>
          <span className="font-bold">{presentes + faltas} de {total}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* General time */}
      <div className="glass-card rounded-xl p-3 mb-4">
        <p className="text-xs font-semibold mb-2">Hora de entrada general</p>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={generalTime}
            onChange={e => setGeneralTime(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm font-mono"
          />
          <Button
            size="sm"
            className="h-9 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={() => setAllStatus('presente')}
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Todos presentes
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-xs border-[#e57373] text-[#e57373] bg-card hover:bg-[#e57373]/10"
            onClick={() => setAllStatus('falta')}
          >
            <X className="w-3.5 h-3.5 mr-1" /> Todos falta
          </Button>
        </div>
      </div>

      {/* Zones */}
      <div className="space-y-2">
        {mockZones.map(zone => {
          const zoneWorkers = getZoneWorkers(zone);
          const fichados = getZoneFichados(zone);
          const isExpanded = expandedZone === zone.id;

          return (
            <div key={zone.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedZone(isExpanded ? null : zone.id)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm font-bold">
                    {zone.name} · {zone.activity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fichados} / {zoneWorkers.length} fichados
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {fichados}/{zoneWorkers.length}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border space-y-1.5">
                  {zoneWorkers.map(worker => (
                    <div key={worker.id} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-[10px] font-bold shrink-0">
                        {worker.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{worker.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setWorkerStatus(worker.id, 'presente')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            worker.status === 'presente'
                              ? 'bg-success text-success-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-success/20'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setWorkerStatus(worker.id, 'falta')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            worker.status === 'falta'
                              ? 'bg-destructive text-destructive-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-destructive/20'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 z-40">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full h-12 text-sm font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-40"
            disabled={presentes === 0}
            onClick={onNext}
          >
            Continuar → Asignar tareas
          </Button>
        </div>
      </div>
    </div>
};

export default FichajeScreen;