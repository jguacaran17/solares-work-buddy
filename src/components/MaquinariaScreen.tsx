import { useState } from "react";
import { mockMachines, mockWorkers, mockActivities, Machine } from "@/lib/mock-data";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MaquinariaScreen = () => {
  const [machines, setMachines] = useState<Machine[]>(mockMachines);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = machines.length;
  const activas = machines.filter(m => m.status === 'activa').length;
  const alertas = machines.filter(m => m.status === 'averia' || m.status === 'parada').length;
  const disponibilidad = total > 0 ? Math.round((activas / total) * 100) : 0;

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0
      ? 'Sin asignar'
      : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(' - ');

  const statusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'activa':
        return <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Activa</span>;
      case 'averia':
        return <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Averia</span>;
      case 'parada':
        return <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">Parada</span>;
    }
  };

  const toggleAveria = (machineId: string) => {
    setMachines(prev =>
      prev.map(m =>
        m.id === machineId
          ? { ...m, status: m.status === 'averia' ? 'activa' : 'averia', hoursToday: m.status !== 'averia' ? 0 : 8.75 }
          : m
      )
    );
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="stat-card">
          <p className="text-lg font-bold">{total}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Total</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold text-success">{activas}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Activas</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold text-destructive">{alertas}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Alertas</p>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">Disponibilidad hoy</span>
          <span className="font-bold">{disponibilidad}% · {activas}/{total}</span>
        </div>
        <Progress value={disponibilidad} className="h-2" />
      </div>

      <p className="text-xs text-muted-foreground mb-3">Toca para asignar operario, hora y tarea</p>

      {/* Machine list */}
      <div className="space-y-2">
        {machines.map(machine => {
          const isExpanded = expandedId === machine.id;

          return (
            <div key={machine.id} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : machine.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground shrink-0">
                  <span className="text-lg">🏗</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold truncate">{machine.name}</p>
                    {machine.status === 'averia' && <span className="text-destructive">●</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {getOperatorNames(machine.operators)}
                  </p>
                  <p className="text-[10px] text-primary font-medium">{machine.task}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  {statusBadge(machine.status)}
                  <span className="text-xs font-mono font-bold">{machine.hoursToday}h</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border space-y-3">
                  {/* Operator select */}
                  <div className="pt-2">
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">Operario</p>
                    <div className="flex flex-wrap gap-1">
                      {mockWorkers.map(w => {
                        const isSelected = machine.operators.includes(w.id);
                        return (
                          <button
                            key={w.id}
                            className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            {w.name}
                          </button>
                        );
                      })}
                      <button className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground">
                        Sin asignar
                      </button>
                    </div>
                  </div>

                  {/* Task select */}
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">Tarea</p>
                    <div className="flex flex-wrap gap-1">
                      {mockActivities.map(act => (
                        <button
                          key={act}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            machine.task === act
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">Hora inicio</p>
                      <input
                        type="time"
                        defaultValue={machine.startTime || ''}
                        className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">Fin estim.</p>
                      <input
                        type="time"
                        defaultValue={machine.endTime || ''}
                        className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">HH reales</p>
                      <input
                        type="number"
                        defaultValue={machine.hoursToday}
                        step="0.25"
                        className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs">
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant={machine.status === 'averia' ? 'default' : 'destructive'}
                      className="flex-1 h-8 text-xs"
                      onClick={() => toggleAveria(machine.id)}
                    >
                      {machine.status === 'averia' ? 'Reparada' : 'Avería'}
                    </Button>
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

export default MaquinariaScreen;