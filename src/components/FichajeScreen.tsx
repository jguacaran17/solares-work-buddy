import { useState } from "react";
import { Check, X, Clock, ChevronDown } from "lucide-react";
import { mockZones, Worker, FaltaMotivo } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FichajeScreenProps {
  workers: Worker[];
  onUpdateWorkers: (workers: Worker[]) => void;
  onNext: () => void;
}

const FichajeScreen = ({ workers, onUpdateWorkers, onNext }: FichajeScreenProps) => {
  const [generalTime, setGeneralTime] = useState("07:00");
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);

  const presentes = workers.filter(w => w.status === 'presente').length;
  const faltas = workers.filter(w => w.status === 'falta').length;
  const sinFichar = workers.filter(w => w.status === 'sin-fichar').length;
  const total = workers.length;
  const fichados = presentes + faltas;
  const progress = total > 0 ? Math.round((fichados / total) * 100) : 0;

  const setAllStatus = (status: 'presente' | 'falta') => {
    const updated = workers.map(w => ({
      ...w,
      status,
      clockIn: status === 'presente' ? generalTime : undefined,
      faltaMotivo: status === 'falta' ? 'Sin avisar' as FaltaMotivo : undefined,
    }));
    onUpdateWorkers(updated);
  };

  const setWorkerStatus = (workerId: string, status: 'presente' | 'falta') => {
    const updated = workers.map(w =>
      w.id === workerId
        ? {
            ...w,
            status,
            clockIn: status === 'presente' ? (w.clockIn || generalTime) : undefined,
            faltaMotivo: status === 'falta' ? (w.faltaMotivo || 'Sin avisar') : undefined,
          }
        : w
    );
    onUpdateWorkers(updated);
  };

  const setWorkerTime = (workerId: string, time: string) => {
    const updated = workers.map(w =>
      w.id === workerId ? { ...w, clockIn: time } : w
    );
    onUpdateWorkers(updated);
  };

  const setWorkerMotivo = (workerId: string, motivo: FaltaMotivo) => {
    const updated = workers.map(w =>
      w.id === workerId ? { ...w, faltaMotivo: motivo } : w
    );
    onUpdateWorkers(updated);
  };

  const getZoneWorkers = (zone: typeof mockZones[0]) =>
    workers.filter(w => zone.workers.includes(w.id));

  const getZoneFichados = (zone: typeof mockZones[0]) =>
    getZoneWorkers(zone).filter(w => w.status !== 'sin-fichar').length;

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto">
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
          <span className="font-bold">{fichados} de {total} fichados</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* General time card */}
      <div className="glass-card rounded-xl p-5 mb-4">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Hora de entrada general
        </p>
        <label className="flex items-center gap-3 mb-4 border border-input rounded-xl px-4 h-14 bg-background cursor-pointer relative">
          <span className="text-2xl font-mono tracking-widest flex-1">{generalTime.replace(':', ' : ')}</span>
          <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="time"
            value={generalTime}
            onChange={e => setGeneralTime(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-12 text-sm font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl"
            onClick={() => setAllStatus('presente')}
          >
            <Check className="w-4 h-4 mr-1.5" /> Todos presentes
          </Button>
          <Button
            variant="outline"
            className="h-12 text-sm font-bold border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-xl"
            onClick={() => setAllStatus('falta')}
          >
            <X className="w-4 h-4 mr-1.5" /> Todos falta
          </Button>
        </div>
      </div>

      {/* Zones */}
      <div className="space-y-3">
        {mockZones.map(zone => {
          const zoneWorkers = getZoneWorkers(zone);
          const zoneFichados = getZoneFichados(zone);
          const isExpanded = expandedZone === zone.id;

          return (
            <div key={zone.id} className="glass-card rounded-xl overflow-hidden">
              {/* Zone header */}
              <button
                onClick={() => setExpandedZone(isExpanded ? null : zone.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left active:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold">
                    {zone.name} · {zone.activity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {zoneFichados} / {zoneWorkers.length} fichados
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    {zoneFichados}/{zoneWorkers.length}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Workers list - smooth expand */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t-2 border-primary">
                  {zoneWorkers.map((worker, idx) => {
                    const isPresente = worker.status === 'presente';
                    const isFalta = worker.status === 'falta';
                    const isWorkerExpanded = expandedWorker === worker.id;

                    return (
                      <div
                        key={worker.id}
                        className={`transition-colors duration-200 ${
                          isFalta ? 'bg-[#fff0f0]' : 'bg-card'
                        } ${idx > 0 ? 'border-t border-border/40' : ''}`}
                      >
                        {/* Worker summary row */}
                        <button
                          onClick={() => setExpandedWorker(isWorkerExpanded ? null : worker.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 active:bg-muted/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold shrink-0">
                            {worker.avatar}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold truncate">{worker.name}</p>
                            {isPresente && (
                              <p className="text-xs text-primary font-medium">
                                Entrada {worker.clockIn || generalTime}
                              </p>
                            )}
                            {isFalta && (
                              <p className="text-xs font-medium text-destructive">
                                Falta: {worker.faltaMotivo || 'Sin avisar'}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isPresente && (
                              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                {worker.clockIn || generalTime}
                              </span>
                            )}
                            {isFalta && (
                              <span className="text-xs font-bold text-destructive">
                                Falta
                              </span>
                            )}
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                                isWorkerExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Worker expanded details */}
                        <div
                          className={`transition-all duration-200 ease-in-out overflow-hidden ${
                            isWorkerExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* Toggle buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setWorkerStatus(worker.id, 'presente')}
                                className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                                  isPresente
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'border-border text-muted-foreground bg-card hover:border-primary/40'
                                }`}
                              >
                                <Check className="w-4 h-4" /> Presente
                              </button>
                              <button
                                onClick={() => setWorkerStatus(worker.id, 'falta')}
                                className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                                  isFalta
                                    ? 'bg-[#c0392b] text-white border-[#c0392b]'
                                    : 'border-border text-muted-foreground bg-card hover:border-destructive/40'
                                }`}
                              >
                                <X className="w-4 h-4" /> Falta
                              </button>
                            </div>

                            {/* Presente: time input */}
                            {isPresente && (
                              <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-xs text-muted-foreground font-medium">Entrada:</span>
                                <input
                                  type="time"
                                  value={worker.clockIn || generalTime}
                                  onChange={e => setWorkerTime(worker.id, e.target.value)}
                                  className="h-8 rounded-lg border border-input bg-background px-3 text-sm font-mono flex-1 min-w-0"
                                />
                              </div>
                            )}

                            {/* Falta: motivo dropdown */}
                            {isFalta && (
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                                  Motivo
                                </p>
                                <select
                                  value={worker.faltaMotivo || 'Sin avisar'}
                                  onChange={e => setWorkerMotivo(worker.id, e.target.value as FaltaMotivo)}
                                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                                >
                                  <option>Sin avisar</option>
                                  <option>Enfermedad</option>
                                  <option>Permiso</option>
                                  <option>Retraso</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 z-40">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full h-12 text-sm font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl disabled:opacity-40"
            disabled={fichados === 0}
            onClick={onNext}
          >
            Continuar → Asignar tareas
            <span className="ml-2 bg-secondary-foreground/20 text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
              {presentes} pres. · {faltas} faltas
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FichajeScreen;
