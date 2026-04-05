import { Worker } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  activity: string;
  workerIds: string[];
}

interface HoursScreenProps {
  workers: Worker[];
  assignments: Assignment[];
  onNext: () => void;
}

const HoursScreen = ({ workers, assignments, onNext }: HoursScreenProps) => {
  const presentWorkers = workers.filter(w => w.status === 'presente');
  const totalHH = presentWorkers.length * 8.75;

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="stat-card">
          <p className="text-lg font-bold">{totalHH > 0 ? `${totalHH.toFixed(1)}` : '—'}</p>
          <p className="text-[10px] text-muted-foreground font-medium">HH total</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold">—</p>
          <p className="text-[10px] text-muted-foreground font-medium">Desviación</p>
        </div>
        <div className="stat-card">
          <p className="text-lg font-bold">—</p>
          <p className="text-[10px] text-muted-foreground font-medium">€ extra</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">Eficiencia del día</span>
          <span className="font-bold">—</span>
        </div>
        <Progress value={0} className="h-2" />
      </div>

      <p className="text-xs text-muted-foreground mb-4">Revisa y ajusta horas si hace falta</p>

      {/* Hours by assignment */}
      {assignments.length > 0 ? (
        <div className="space-y-2 mb-4">
          {assignments.map(assignment => {
            const assignedWorkers = workers.filter(w => assignment.workerIds.includes(w.id));
            return (
              <div key={assignment.activity} className="glass-card rounded-xl p-3">
                <p className="text-sm font-bold mb-2">{assignment.activity}</p>
                <div className="space-y-1.5">
                  {assignedWorkers.map(w => (
                    <div key={w.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-[9px] font-bold flex items-center justify-center">
                          {w.avatar}
                        </div>
                        <span>{w.name}</span>
                      </div>
                      <span className="font-mono font-bold">8.75h</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-6 text-center mb-4">
          <p className="text-sm text-muted-foreground">No hay asignaciones aún</p>
        </div>
      )}

      <Button className="w-full" onClick={onNext}>
        Revisar resumen → Enviar
      </Button>
    </div>
  );
};

export default HoursScreen;