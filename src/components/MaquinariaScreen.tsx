import { useState } from "react";
import { mockMachines, mockWorkers, mockActivities, Machine } from "@/lib/mock-data";
import { toast } from "sonner";

const MaquinariaScreen = () => {
  const [machines, setMachines] = useState<Machine[]>(mockMachines);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'maq' | 'flota' | 'incid'>('maq');

  const total = machines.length;
  const activas = machines.filter(m => m.status === 'activa').length;
  const alertas = machines.filter(m => m.status === 'averia' || m.status === 'parada').length;
  const disponibilidad = total > 0 ? Math.round((activas / total) * 100) : 0;

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0 ? 'Sin asignar' : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(' - ');

  const toggleAveria = (machineId: string) => {
    setMachines(prev =>
      prev.map(m =>
        m.id === machineId
          ? { ...m, status: m.status === 'averia' ? 'activa' : 'averia', hoursToday: m.status !== 'averia' ? 0 : 8.75 }
          : m
      )
    );
  };

  const tabs = [
    { id: 'maq' as const, label: 'Maquinaria', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="14" height="9" rx="2"/><rect x="10" y="4" width="8" height="6" rx="1"/><circle cx="6" cy="19" r="3"/><circle cx="17" cy="19" r="2"/><line x1="16" y1="8" x2="10" y2="8"/></svg> },
    { id: 'flota' as const, label: 'Flota', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="12"/><path d="M16 8h4l3 4v4h-7"/><circle cx="5.5" cy="17.5" r="1.5"/><circle cx="18.5" cy="17.5" r="1.5"/></svg> },
    { id: 'incid' as const, label: 'Incidencias', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg> },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1.5 mb-3" style={{ margin: '4px 0 12px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 px-1 rounded-[7px] border text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1"
            style={{
              background: activeTab === tab.id ? 'hsl(var(--g8))' : 'hsl(var(--card))',
              color: activeTab === tab.id ? '#fff' : 'hsl(var(--muted-foreground))',
              borderColor: activeTab === tab.id ? 'hsl(var(--g8))' : 'hsl(var(--border))',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'maq' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="stat-card"><div className="kmi-label">Total</div><div className="kmi-value">{total}</div></div>
            <div className="stat-card"><div className="kmi-label">Activas</div><div className="kmi-value text-success">{activas}</div></div>
            <div className="stat-card"><div className="kmi-label">Alertas</div><div className="kmi-value text-destructive">{alertas}</div></div>
          </div>

          <div className="mb-3.5">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Disponibilidad hoy</span>
              <span>{disponibilidad}% · {activas}/{total}</span>
            </div>
            <div className="prog-track">
              <div className={`prog-fill ${disponibilidad >= 90 ? 'prog-fill-ok' : 'prog-fill-warn'}`} style={{ width: `${disponibilidad}%` }} />
            </div>
          </div>

          <div className="sec-title">Toca para asignar operario, hora y tarea</div>

          <div className="glass-card rounded-[10px] overflow-hidden">
            {machines.map((machine) => {
              const isExpanded = expandedId === machine.id;
              const isAveria = machine.status === 'averia';
              const isParada = machine.status === 'parada';
              const dotClass = isAveria ? '#c0392b' : isParada ? '#e8a020' : '#2ecc71';
              const pillClass = isAveria ? 'pill-danger' : isParada ? 'pill-warn' : 'pill-ok';
              const pillText = isAveria ? 'Averia' : isParada ? 'Parada' : 'Activa';
              const hoursColor = isAveria ? 'hsl(var(--destructive))' : isParada ? 'hsl(var(--warning))' : 'hsl(var(--g6))';
              const rowBg = isAveria ? 'hsl(var(--red-bg))' : isParada ? 'hsl(var(--amber-bg))' : '';

              return (
                <div key={machine.id} style={{ borderBottom: '1px solid hsl(var(--border))', background: rowBg }}>
                  <div
                    className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : machine.id)}
                  >
                    <span className="w-[9px] h-[9px] rounded-full inline-block flex-shrink-0" style={{ background: dotClass, marginTop: 2 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold" style={{ color: isAveria ? 'hsl(var(--destructive))' : isParada ? 'hsl(var(--amber-text))' : '' }}>
                        {machine.name} {isAveria && <span className="text-destructive text-[11px]">●</span>}
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
                      <div className="text-[11px] font-mono font-bold mt-1" style={{ color: hoursColor }}>{machine.hoursToday}h</div>
                    </div>
                    <span className="text-[12px] text-muted-foreground">›</span>
                  </div>

                  {isExpanded && (
                    <div className="px-3.5 py-2.5 border-t border-border" style={{ background: '#fafaf8' }}>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Operario</div>
                          <select className="w-full border border-border rounded-md px-2 py-1.5 text-[12px]" style={{ background: 'hsl(var(--background))' }}>
                            {mockWorkers.map(w => (
                              <option key={w.id} selected={machine.operators.includes(w.id)}>{w.name}</option>
                            ))}
                            <option>Sin asignar</option>
                          </select>
                        </div>
                        <div>
                          <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Tarea</div>
                          <select className="w-full border border-border rounded-md px-2 py-1.5 text-[12px]" style={{ background: 'hsl(var(--background))' }}>
                            {mockActivities.map(a => (
                              <option key={a} selected={machine.task === a}>{a}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        <div>
                          <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Hora inicio</div>
                          <input type="time" defaultValue={machine.startTime || '07:00'} className="w-full border border-border rounded-md px-1.5 py-1.5 font-mono text-[12px]" style={{ background: 'hsl(var(--background))' }} />
                        </div>
                        <div>
                          <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Fin estim.</div>
                          <input type="time" defaultValue={machine.endTime || '18:00'} className="w-full border border-border rounded-md px-1.5 py-1.5 font-mono text-[12px]" style={{ background: 'hsl(var(--background))' }} />
                        </div>
                        <div>
                          <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">HH reales</div>
                          <input type="number" defaultValue={machine.hoursToday} step="0.25" min="0" className="w-full border border-border rounded-md px-1.5 py-1.5 font-mono text-[12px]" style={{ background: 'hsl(var(--background))' }} />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { toast.success(`Guardado: ${machine.name}`); setExpandedId(null); }}
                          className="flex-[2] py-2 rounded-[7px] border-none text-[12px] font-bold cursor-pointer"
                          style={{ background: 'hsl(var(--g8))', color: '#fff' }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => toggleAveria(machine.id)}
                          className="flex-1 py-2 rounded-[7px] text-[11px] font-bold cursor-pointer"
                          style={{ border: '1px solid hsl(var(--destructive))', background: 'hsl(var(--red-bg))', color: 'hsl(var(--destructive))' }}
                        >
                          {isAveria ? 'Reparada' : 'Averia'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Alert note */}
          {alertas > 0 && (
            <div className="rounded-lg px-3.5 py-2.5 mt-1.5 text-[11px]" style={{ background: 'hsl(var(--red-bg))', border: '1px solid #f5c6c6', color: '#8b3030' }}>
              <b>{machines.filter(m => m.status !== 'activa').map(m => m.name).join('</b> y <b>')}</b> tienen incidencia activa — toca en Incidencias para más detalle.
            </div>
          )}
        </>
      )}

      {activeTab === 'flota' && (
        <div className="glass-card rounded-[10px] p-6 text-center">
          <p className="text-2xl mb-2">🚛</p>
          <p className="text-sm font-bold mb-1">Flota de vehículos</p>
          <p className="text-xs text-muted-foreground">Gestión de flota. Próximamente.</p>
        </div>
      )}

      {activeTab === 'incid' && (
        <div className="glass-card rounded-[10px] p-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm font-bold mb-1">Incidencias</p>
          <p className="text-xs text-muted-foreground">Reporte de incidencias. Próximamente.</p>
        </div>
      )}
    </>
  );
};

export default MaquinariaScreen;
