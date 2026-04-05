import { useState } from "react";
import { mockMachines, mockWorkers, Machine } from "@/lib/mock-data";
import { toast } from "sonner";

const MaquinariaScreen = () => {
  const [machines, setMachines] = useState<Machine[]>(mockMachines);

  const incidentMachines = machines.filter(m => m.status === 'averia' || m.status === 'parada');
  const averias = machines.filter(m => m.status === 'averia').length;
  const paradas = machines.filter(m => m.status === 'parada').length;

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0 ? 'Sin asignar' : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(', ');

  const resolveIncident = (machineId: string) => {
    setMachines(prev =>
      prev.map(m => m.id === machineId ? { ...m, status: 'activa' as const, hoursToday: 8.75 } : m)
    );
    toast.success('Incidencia resuelta');
  };

  return (
    <>
      <div className="sec-title" style={{ marginTop: 4 }}>Incidencias activas</div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="stat-card text-center py-2">
          <div className="text-[18px] font-bold text-destructive">{averias + paradas}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Total</div>
        </div>
        <div className="stat-card text-center py-2">
          <div className="text-[18px] font-bold text-destructive">{averias}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Averías</div>
        </div>
        <div className="stat-card text-center py-2">
          <div className="text-[18px] font-bold" style={{ color: 'hsl(var(--amber-text))' }}>{paradas}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Paradas</div>
        </div>
      </div>

      {incidentMachines.length === 0 ? (
        <div className="glass-card rounded-[10px] p-6 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-bold mb-1">Sin incidencias</p>
          <p className="text-xs text-muted-foreground">Toda la maquinaria está operativa.</p>
        </div>
      ) : (
        <div className="glass-card rounded-[10px] overflow-hidden">
          {incidentMachines.map((machine) => {
            const isAveria = machine.status === 'averia';
            const rowBg = isAveria ? 'hsl(var(--red-bg))' : 'hsl(var(--amber-bg))';
            const pillClass = isAveria ? 'pill-danger' : 'pill-warn';
            const pillText = isAveria ? 'Avería' : 'Parada';

            return (
              <div key={machine.id} style={{ borderBottom: '1px solid hsl(var(--border))', background: rowBg }}>
                <div className="px-3.5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[13px] font-bold" style={{ color: isAveria ? 'hsl(var(--destructive))' : 'hsl(var(--amber-text))' }}>
                      {machine.name}
                    </div>
                    <span className={`pill ${pillClass}`}>{pillText}</span>
                  </div>
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] rounded px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,.6)', border: '1px solid hsl(var(--border))' }}>
                      {getOperatorNames(machine.operators)}
                    </span>
                    <span className="text-[10px] rounded px-1.5 py-0.5 font-mono" style={{ background: 'rgba(255,255,255,.6)', border: '1px solid hsl(var(--border))' }}>
                      {machine.task}
                    </span>
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
            );
          })}
        </div>
      )}
    </>
  );
};

export default MaquinariaScreen;
