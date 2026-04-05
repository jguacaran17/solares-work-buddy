import { useState, useMemo } from "react";
import { Worker, mockActivitySubtasks, defaultSubtasks } from "@/lib/mock-data";
import { toast } from "sonner";

interface Assignment {
  activity: string;
  workerIds: string[];
}

interface EnviarScreenProps {
  workers: Worker[];
  assignments: Assignment[];
}

const COST_PER_HOUR = 28;

const EnviarScreen = ({ workers, assignments }: EnviarScreenProps) => {
  const [comments, setComments] = useState('Hormigón: 10m³ = 39 ud. Hay que recevar.');

  const presentWorkers = workers.filter(w => w.status === 'presente');

  const stats = useMemo(() => {
    let hh = 0;
    let teo = 0;
    const subs: { name: string; ops: number; hh: number }[] = [];

    assignments.forEach(a => {
      const subtasks = mockActivitySubtasks[a.activity] || defaultSubtasks;
      const t = subtasks.reduce((s, st) => s + st.standardHours, 0);
      const count = a.workerIds.length;
      hh += t * count;
      teo += t * count;
      subs.push({ name: a.activity, ops: count, hh: t * count });
    });

    const dv = 0; // since hours == theoretical
    const eu = Math.round(dv * COST_PER_HOUR);
    return { hh, dv, eu, subs };
  }, [assignments]);

  const handleSend = () => {
    toast.success('Parte enviado. Jefe de obra notificado.');
  };

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <>
      <div className="sec-title" style={{ marginTop: 4 }}>Resumen parte — {dateStr}</div>

      <div className="glass-card rounded-[10px] p-3.5 mb-2.5">
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">Capataz</span>
          <span className="text-[13px] font-bold font-mono">Pepe Cabrerizo</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">Operarios presentes</span>
          <span className="text-[13px] font-bold font-mono text-success">{presentWorkers.length || '—'} operarios</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">HH totales</span>
          <span className="text-[13px] font-bold font-mono">{stats.hh > 0 ? `${stats.hh.toFixed(0)}h` : '—'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-[12px] text-muted-foreground">Desviación</span>
          <span className="text-[13px] font-bold font-mono">{stats.dv >= 0 ? '+' : ''}{stats.dv.toFixed(1)}h</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-[12px] text-muted-foreground">Coste extra</span>
          <span className="text-[13px] font-bold font-mono">{stats.eu > 0 ? `-EUR${stats.eu}` : `+EUR${Math.abs(stats.eu)}`}</span>
        </div>
      </div>

      <div className="sec-title">Por subtarea</div>
      <div className="glass-card rounded-[10px] mb-2.5" style={{ padding: '0 14px' }}>
        {stats.subs.length > 0 ? stats.subs.map((s, i) => (
          <div key={s.name} className="flex justify-between py-2" style={{ borderBottom: i < stats.subs.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
            <span className="text-[12px] text-muted-foreground">{s.name}</span>
            <span className="text-[13px] font-bold font-mono">{s.ops} op · {s.hh.toFixed(1)}h</span>
          </div>
        )) : (
          <div className="text-[12px] text-muted-foreground text-center py-4">Sin asignaciones</div>
        )}
      </div>


      <button className="sbtn" onClick={handleSend}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        Enviar parte al jefe de obra
      </button>
    </>
  );
};

export default EnviarScreen;
