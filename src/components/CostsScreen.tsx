import { mockZoneCosts } from "@/lib/mock-data";
import { BarChart3, TrendingUp, Users, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const CostsScreen = () => {
  const totalCost = mockZoneCosts.reduce((sum, z) => sum + z.totalCost, 0);
  const totalHours = mockZoneCosts.reduce((sum, z) => sum + z.hoursTotal, 0);
  const totalWorkers = mockZoneCosts.reduce((sum, z) => sum + z.workers, 0);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div className="mb-5">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Vista de dirección
        </p>
        <h2 className="text-xl font-bold mt-1">Resumen de costes</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-[10px] text-muted-foreground font-medium uppercase">Coste total</span>
          </div>
          <p className="text-2xl font-extrabold">{totalCost.toLocaleString('es-ES')}€</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-info" />
            <span className="text-[10px] text-muted-foreground font-medium uppercase">Operarios</span>
          </div>
          <p className="text-2xl font-extrabold">{totalWorkers}</p>
          <p className="text-xs text-muted-foreground">{totalHours}h totales</p>
        </div>
      </div>

      {/* Zone breakdown */}
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4" /> Desglose por zona
      </h3>
      <div className="space-y-3">
        {mockZoneCosts.map((zone) => (
          <div key={zone.zone} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold">{zone.zone}</p>
                <p className="text-xs text-muted-foreground">
                  {zone.workers} operarios · {zone.hoursTotal}h
                </p>
              </div>
              <p className="text-lg font-extrabold text-primary">
                {zone.totalCost.toLocaleString('es-ES')}€
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium">Avance</span>
                <span className="text-[10px] font-bold">{zone.progress}%</span>
              </div>
              <Progress value={zone.progress} className="h-2" />
            </div>

            <div className="mt-2 pt-2 border-t border-border flex justify-between text-[10px] text-muted-foreground">
              <span>€/hora: {zone.costPerHour}€</span>
              <span>€/operario: {(zone.totalCost / zone.workers).toFixed(0)}€</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostsScreen;
