import { useState } from "react";
import { Machine, mockWorkers, mockActivities } from "@/lib/mock-data";

interface MaquinariaStepScreenProps {
  machines: Machine[];
  onUpdateMachines: (machines: Machine[]) => void;
  onNext: () => void;
}

const MaquinariaStepScreen = ({ machines, onUpdateMachines, onNext }: MaquinariaStepScreenProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = machines.length;
  const activas = machines.filter(m => m.status === 'activa').length;
  const averias = machines.filter(m => m.status === 'averia').length;
  const paradas = machines.filter(m => m.status === 'parada').length;

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0 ? 'Sin asignar' : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(', ');

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    onUpdateMachines(machines.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  return (
    <>
      <div className="sec-title" style={{ marginTop: 4 }}>Revisa maquinaria del día</div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <div className="stat-card text-center py-2">
          <div className="text-[16px] font-bold">{total}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Total</div>
        </div>
        <div className="stat-card text-center py-2">
          <div className="text-[16px] font-bold" style={{ color: 'hsl(var(--g4))' }}>{activas}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Activas</div>
        </div>
        <div className="stat-card text-center py-2">
          <div className="text-[16px] font-bold text-destructive">{averias}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Avería</div>
        </div>
        <div className="stat-card text-center py-2">
          <div className="text-[16px] font-bold" style={{ color: 'hsl(var(--amber-text))' }}>{paradas}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Parada</div>
        </div>
      </div>

      {/* Machine list */}
      <div className="glass-card rounded-[10px] overflow-hidden mb-3">
        {machines.map((machine) => {
          const isExpanded = expandedId === machine.id;
          const isAveria = machine.status === 'averia';
          const isParada = machine.status === 'parada';
          const dotColor = isAveria ? '#c0392b' : isParada ? '#e8a020' : '#2ecc71';
          const pillClass = isAveria ? 'pill-danger' : isParada ? 'pill-warn' : 'pill-ok';
          const pillText = isAveria ? 'Avería' : isParada ? 'Parada' : 'Activa';
          const rowBg = isAveria ? 'hsl(var(--red-bg))' : isParada ? 'hsl(var(--amber-bg))' : '';

          return (
            <div key={machine.id} style={{ borderBottom: '1px solid hsl(var(--border))', background: rowBg }}>
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : machine.id)}
              >
                <span className="w-[9px] h-[9px] rounded-full inline-block flex-shrink-0" style={{ background: dotColor, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold" style={{ color: isAveria ? 'hsl(var(--destructive))' : isParada ? 'hsl(var(--amber-text))' : '' }}>
                    {machine.name}
                  </div>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] rounded px-1.5 py-0.5" style={{ background: 'hsl(var(--g05))', border: '1px solid hsl(var(--g2))', color: 'hsl(var(--g7))' }}>
                      {getOperatorNames(machine.operators)}
                    </span>
                    <span className="text-[10px] rounded px-1.5 py-0.5 font-mono" style={{ background: '#f0f0ee', color: 'hsl(var(--muted-foreground))' }}>
                      {machine.task}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`pill ${pillClass}`}>{pillText}</span>
                  <div className="text-[11px] font-mono font-bold mt-1" style={{ color: isAveria ? 'hsl(var(--destructive))' : isParada ? 'hsl(var(--amber-text))' : 'hsl(var(--g6))' }}>
                    {machine.hoursToday}h
                  </div>
                </div>
                <span className="text-[12px] text-muted-foreground" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              </div>

              {isExpanded && (
                <div className="px-3.5 py-2.5 border-t border-border" style={{ background: '#fafaf8' }}>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Operario</div>
                      <select
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px]"
                        style={{ background: 'hsl(var(--background))' }}
                        value={machine.operators[0] || ''}
                        onChange={e => updateMachine(machine.id, { operators: e.target.value ? [e.target.value] : [] })}
                      >
                        <option value="">Sin asignar</option>
                        {mockWorkers.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Tarea</div>
                      <select
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px]"
                        style={{ background: 'hsl(var(--background))' }}
                        value={machine.task}
                        onChange={e => updateMachine(machine.id, { task: e.target.value })}
                      >
                        {mockActivities.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">HH reales</div>
                      <input
                        type="number"
                        value={machine.hoursToday}
                        step="0.25"
                        min="0"
                        onChange={e => updateMachine(machine.id, { hoursToday: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-border rounded-md px-2 py-1.5 font-mono text-[12px]"
                        style={{ background: 'hsl(var(--background))' }}
                      />
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Estado</div>
                      <select
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px]"
                        style={{ background: 'hsl(var(--background))' }}
                        value={machine.status}
                        onChange={e => {
                          const status = e.target.value as Machine['status'];
                          updateMachine(machine.id, {
                            status,
                            hoursToday: status !== 'activa' ? 0 : machine.hoursToday || 8.75,
                          });
                        }}
                      >
                        <option value="activa">Activa</option>
                        <option value="averia">Avería</option>
                        <option value="parada">Parada</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="sbtn"
        onClick={onNext}
      >
        Revisar resumen → Enviar
      </button>
    </>
  );
};

export default MaquinariaStepScreen;
