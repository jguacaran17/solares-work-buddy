import { useState } from "react";
import { Worker, projectInfo } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  activity: string;
  workerIds: string[];
}

interface EnviarScreenProps {
  workers: Worker[];
  assignments: Assignment[];
}

const EnviarScreen = ({ workers, assignments }: EnviarScreenProps) => {
  const [comments, setComments] = useState('Hormigón: 10m³ = 39 ud. Hay que recevar.');
  const presentWorkers = workers.filter(w => w.status === 'presente');
  const totalHH = presentWorkers.length * 8.75;

  const handleSend = () => {
    toast.success('Parte enviado correctamente al jefe de obra');
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h2 className="text-base font-bold mb-4">Resumen parte — {projectInfo.date}/2026</h2>

      {/* Summary card */}
      <div className="glass-card rounded-xl p-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Capataz</span>
          <span className="font-semibold">{projectInfo.foreman}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Operarios presentes</span>
          <span className="font-semibold">{presentWorkers.length || '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">HH totales</span>
          <span className="font-semibold">{totalHH > 0 ? totalHH.toFixed(1) : '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Desviación</span>
          <span className="font-semibold">—</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Coste extra</span>
          <span className="font-semibold">—</span>
        </div>
      </div>

      {/* By subtask */}
      <p className="text-xs font-bold mb-2">Por subtarea</p>
      <div className="glass-card rounded-xl overflow-hidden mb-4">
        {assignments.length > 0 ? (
          <div className="divide-y divide-border">
            {assignments.map(a => (
              <div key={a.activity} className="px-3 py-2 flex items-center justify-between text-sm">
                <span>{a.activity}</span>
                <span className="font-mono font-bold text-xs">
                  {a.workerIds.length} op · {(a.workerIds.length * 8.75).toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">Sin asignaciones</p>
        )}
      </div>

      {/* Comments */}
      <p className="text-xs font-bold mb-2">Comentarios</p>
      <textarea
        value={comments}
        onChange={e => setComments(e.target.value)}
        className="w-full h-20 rounded-xl border border-input bg-card px-3 py-2 text-sm resize-none mb-4"
        placeholder="Añade comentarios..."
      />

      <Button className="w-full h-12" onClick={handleSend}>
        <Send className="w-4 h-4 mr-2" />
        Enviar parte al jefe de obra
      </Button>
    </div>
  );
};

export default EnviarScreen;