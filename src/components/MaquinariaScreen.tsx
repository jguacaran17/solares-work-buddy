import { mockWorkers, Machine } from "@/lib/mock-data";
import { toast } from "sonner";

interface MaquinariaScreenProps {
  machines: Machine[];
  onUpdateMachines: (machines: Machine[]) => void;
}

const MaquinariaScreen = ({ machines, onUpdateMachines }: MaquinariaScreenProps) => {
  const incidentMachines = machines.filter(m => m.status === 'averia');
  const averias = incidentMachines.length;

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0 ? 'Sin asignar' : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(', ');

  const resolveIncident = (machineId: string) => {
    onUpdateMachines(machines.map(m => m.id === machineId ? { ...m, status: 'activa' as const, hoursToday: 8.75 } : m));
    toast.success('Incidencia resuelta');
  };

  return (
    <>
      <div className="sec-title" style={{ marginTop: 4 }}>Incidencias activas</div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-2 mb-3" style={{ maxWidth: 120 }}>
        <div className="stat-card text-center py-2">
          <div className="text-[18px] font-bold text-destructive">{averias}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Averías</div>
        </div>
      </div>

      {incidentMachines.length === 0 ? (
        <div className="glass-card rounded-[10px] p-6 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-bold mb-1">Sin incidencias activas</p>
          <p className="text-xs text-muted-foreground">Ninguna máquina tiene avería reportada.</p>
        </div>
      ) : (
        <div className="glass-card rounded-[10px] overflow-hidden">
          {incidentMachines.map((machine) => (
            <div key={machine.id} style={{ borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--red-bg))' }}>
              <div className="px-3.5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-bold" style={{ color: 'hsl(var(--destructive))' }}>
                    {machine.name}
                  </div>
                  <span className="pill pill-danger">Avería</span>
                </div>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  <span className="text-[10px] rounded px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,.6)', border: '1px solid hsl(var(--border))' }}>
                    {getOperatorNames(machine.operators)}
                  </span>
                  {machine.task && (
                    <span className="text-[10px] rounded px-1.5 py-0.5 font-mono" style={{ background: 'rgba(255,255,255,.6)', border: '1px solid hsl(var(--border))' }}>
                      {machine.task}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => resolveIncident(machine.id)}
                  className="w-full py-2 rounded-[7px] border-none text-[11px] font-bold cursor-pointer"
                  style={{ background: 'hsl(var(--g8))', color: '#fff' }}
                >
                  Marcar como resuelta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MaquinariaScreen;
