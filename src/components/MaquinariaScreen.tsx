import { useState, useEffect } from "react";
import { mockWorkers, Machine } from "@/lib/mock-data";
import { toast } from "sonner";

interface MaquinariaScreenProps {
  machines: Machine[];
  onUpdateMachines: (machines: Machine[]) => void;
  preFill?: { name: string; tab: 'maquinaria' | 'flota' } | null;
  onClearPreFill?: () => void;
}

const MaquinariaScreen = ({ machines, onUpdateMachines, preFill, onClearPreFill }: MaquinariaScreenProps) => {
  const incidentMachines = machines.filter(m => m.status === 'averia');
  const averias = incidentMachines.length;
  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab] = useState<'maquinaria' | 'flota'>('maquinaria');
  const [formMachineName, setFormMachineName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    if (preFill) {
      setFormTab(preFill.tab);
      setFormMachineName(preFill.name);
      setShowForm(true);
      onClearPreFill?.();
    }
  }, [preFill]);

  const getOperatorNames = (ids: string[]) =>
    ids.length === 0 ? 'Sin asignar' : ids.map(id => mockWorkers.find(w => w.id === id)?.name || '?').join(', ');

  const resolveIncident = (machineId: string) => {
    onUpdateMachines(machines.map(m => m.id === machineId ? { ...m, status: 'activa' as const, hoursToday: 8.75 } : m));
    toast.success('Incidencia resuelta');
  };

  const handleSubmitIncidencia = () => {
    if (!formMachineName) {
      toast.error('Selecciona una máquina');
      return;
    }
    const found = machines.find(m => m.name === formMachineName);
    if (found) {
      onUpdateMachines(machines.map(m => m.id === found.id ? { ...m, status: 'averia' as const, hoursToday: 0 } : m));
    }
    toast.success('Incidencia reportada');
    setShowForm(false);
    setFormMachineName('');
    setFormDescription('');
  };

  return (
    <>
      <div className="sec-title" style={{ marginTop: 4 }}>Incidencias activas</div>

      <div className="grid grid-cols-1 gap-2 mb-3" style={{ maxWidth: 120 }}>
        <div className="stat-card text-center py-2">
          <div className="text-[18px] font-bold text-destructive">{averias}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Averías</div>
        </div>
      </div>

      {/* Report button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-2.5 rounded-lg text-[12px] font-bold border-none cursor-pointer mb-3 flex items-center justify-center gap-1.5"
        style={{ background: 'hsl(var(--red-bg))', color: 'hsl(var(--destructive))', border: '1px solid #fca5a5' }}
      >
        ⚠ Reportar nueva incidencia
      </button>

      {/* Incidencia form */}
      {showForm && (
        <div className="glass-card rounded-[10px] p-3.5 mb-3">
          <div className="text-[12px] font-bold mb-2">Nueva incidencia</div>
          <div className="flex gap-1.5 mb-2">
            {(['maquinaria', 'flota'] as const).map(tab => (
              <button key={tab} onClick={() => setFormTab(tab)}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold border-none cursor-pointer"
                style={{ background: formTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--g1))', color: formTab === tab ? '#fff' : 'hsl(var(--g6))' }}>
                {tab === 'maquinaria' ? 'Maquinaria' : 'Flota'}
              </button>
            ))}
          </div>
          <select
            value={formMachineName}
            onChange={e => setFormMachineName(e.target.value)}
            className="w-full border border-border rounded-md px-2.5 py-2 text-[12px] mb-2"
            style={{ background: 'hsl(var(--background))' }}
          >
            <option value="">Seleccionar {formTab === 'maquinaria' ? 'máquina' : 'vehículo'}...</option>
            {machines.filter(m => m.category === formTab).map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          <textarea
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder="Descripción de la avería..."
            className="w-full min-h-[50px] border border-border rounded-md px-2.5 py-2 text-[11px] resize-none mb-2"
            style={{ background: 'hsl(var(--background))' }}
          />
          <div className="flex gap-2">
            <button onClick={handleSubmitIncidencia}
              className="flex-1 py-2 rounded-lg text-[11px] font-bold border-none cursor-pointer"
              style={{ background: 'hsl(var(--destructive))', color: '#fff' }}>
              Reportar avería
            </button>
            <button onClick={() => { setShowForm(false); setFormMachineName(''); setFormDescription(''); }}
              className="px-4 py-2 rounded-lg text-[11px] font-bold border border-border cursor-pointer"
              style={{ background: 'hsl(var(--background))' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

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
