import { useState } from "react";
import { Machine, mockWorkers, mockActivities } from "@/lib/mock-data";
import { Construction, Truck, Lock } from "lucide-react";

interface MaquinariaStepScreenProps {
  machines: Machine[];
  onUpdateMachines: (machines: Machine[]) => void;
  onNext: () => void;
}

const MaquinariaStepScreen = ({ machines, onUpdateMachines, onNext }: MaquinariaStepScreenProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const maquinaria = machines.filter(m => m.category === 'maquinaria');
  const flota = machines.filter(m => m.category === 'flota');

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0 ? 'Sin asignar' : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(', ');

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    onUpdateMachines(machines.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const renderKPIs = (list: Machine[]) => {
    const total = list.length;
    const activas = list.filter(m => m.status === 'activa').length;
    const averias = list.filter(m => m.status === 'averia').length;
    const paradas = list.filter(m => m.status === 'parada').length;
    return (
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <div className="stat-card text-center py-1.5">
          <div className="text-[15px] font-bold">{total}</div>
          <div className="text-[8px] text-muted-foreground uppercase">Total</div>
        </div>
        <div className="stat-card text-center py-1.5">
          <div className="text-[15px] font-bold" style={{ color: 'hsl(var(--g4))' }}>{activas}</div>
          <div className="text-[8px] text-muted-foreground uppercase">Activas</div>
        </div>
        <div className="stat-card text-center py-1.5">
          <div className="text-[15px] font-bold text-destructive">{averias}</div>
          <div className="text-[8px] text-muted-foreground uppercase">Avería</div>
        </div>
        <div className="stat-card text-center py-1.5">
          <div className="text-[15px] font-bold" style={{ color: 'hsl(var(--amber-text))' }}>{paradas}</div>
          <div className="text-[8px] text-muted-foreground uppercase">Parada</div>
        </div>
      </div>
    );
  };

  const renderTotalsRow = (list: Machine[]) => {
    const activas = list.filter(m => m.status === 'activa');
    const totalHH = activas.reduce((sum, m) => sum + m.hoursToday, 0);
    return (
      <div
        className="flex items-center justify-between px-3.5 py-2.5"
        style={{ background: 'hsl(var(--g1))', borderTop: '2px solid hsl(var(--g2))' }}
      >
        <span className="text-[10px] font-bold uppercase text-muted-foreground">
          Totales: {list.length} máquinas
        </span>
        <div className="flex gap-3 items-center">
          <span className="text-[10px] font-bold" style={{ color: 'hsl(var(--g4))' }}>
            {activas.length} activas
          </span>
          <span className="text-[11px] font-mono font-bold" style={{ color: 'hsl(var(--g6))' }}>
            {totalHH.toFixed(1)}h HH
          </span>
        </div>
      </div>
    );
  };

  const renderMachineList = (list: Machine[]) => (
    <div className="glass-card rounded-[10px] overflow-hidden mb-3">
      {list.map((machine) => {
        const isExpanded = expandedId === machine.id;
        const isAveria = machine.status === 'averia';
        const isParada = machine.status === 'parada';
        const dotColor = isAveria ? '#c0392b' : isParada ? '#e8a020' : '#2ecc71';
        const pillClass = isAveria ? 'pill-danger' : isParada ? 'pill-warn' : 'pill-ok';
        const pillText = isAveria ? 'Avería' : isParada ? 'Parada' : 'Activa';
        const rowBg = isAveria ? 'hsl(var(--red-bg))' : isParada ? 'hsl(var(--amber-bg))' : '';
        const isLocked = isAveria;

        return (
          <div key={machine.id} style={{ borderBottom: '1px solid hsl(var(--border))', background: rowBg }}>
            <div
              className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer"
              onClick={() => !isLocked && setExpandedId(isExpanded ? null : machine.id)}
              style={{ opacity: isLocked ? 0.7 : 1 }}
            >
              <span className="w-[9px] h-[9px] rounded-full inline-block flex-shrink-0" style={{ background: dotColor, marginTop: 2 }} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold" style={{ color: isAveria ? 'hsl(var(--destructive))' : isParada ? 'hsl(var(--amber-text))' : '' }}>
                  {machine.name}
                </div>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] rounded px-1.5 py-0.5" style={{ background: 'hsl(var(--g05))', border: '1px solid hsl(var(--g2))', color: 'hsl(var(--g7))' }}>
                    {getOperatorNames(machine.operators)}
                  </span>
                  {machine.task && (
                    <span className="text-[10px] rounded px-1.5 py-0.5 font-mono" style={{ background: '#f0f0ee', color: 'hsl(var(--muted-foreground))' }}>
                      {machine.task}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`pill ${pillClass}`}>{pillText}</span>
                <div className="text-[11px] font-mono font-bold mt-1" style={{ color: isAveria ? 'hsl(var(--destructive))' : isParada ? 'hsl(var(--amber-text))' : 'hsl(var(--g6))' }}>
                  {machine.hoursToday}h
                </div>
              </div>
              {!isLocked && (
                <span className="text-[12px] text-muted-foreground" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              )}
              {isLocked && (
                <Lock className="text-muted-foreground" size={14} />
              )}
            </div>

            {isExpanded && !isLocked && (
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
                      <option value="">Sin tarea</option>
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
      {renderTotalsRow(list)}
    </div>
  );

  return (
    <>
      <div className="sec-title flex items-center gap-2" style={{ marginTop: 4 }}>
        <Construction size={18} className="text-muted-foreground" />
        Maquinaria
      </div>
      {renderKPIs(maquinaria)}
      {renderMachineList(maquinaria)}

      <div className="sec-title flex items-center gap-2" style={{ marginTop: 8 }}>
        <Truck size={18} className="text-muted-foreground" />
        Flota
      </div>
      {renderKPIs(flota)}
      {renderMachineList(flota)}

      <button className="sbtn" onClick={onNext}>
        Revisar resumen → Enviar
      </button>
    </>
  );
};

export default MaquinariaStepScreen;