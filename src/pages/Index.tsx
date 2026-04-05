import { useState } from "react";
import { mockWorkers as initialWorkers, Worker } from "@/lib/mock-data";
import AppHeader from "@/components/AppHeader";
import StepNav from "@/components/StepNav";
import FichajeScreen from "@/components/FichajeScreen";
import AsignacionesScreen from "@/components/AsignacionesScreen";
import HoursScreen from "@/components/HoursScreen";
import EnviarScreen from "@/components/EnviarScreen";
import MaquinariaScreen from "@/components/MaquinariaScreen";
import FlotaScreen from "@/components/FlotaScreen";
import IncidenciasScreen from "@/components/IncidenciasScreen";
import BottomNav from "@/components/BottomNav";

interface Assignment {
  activity: string;
  workerIds: string[];
}

const Index = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [bottomTab, setBottomTab] = useState('parte');
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const renderParteStep = () => {
    switch (activeStep) {
      case 1:
        return <FichajeScreen workers={workers} onUpdateWorkers={setWorkers} onNext={() => setActiveStep(2)} />;
      case 2:
        return <AsignacionesScreen workers={workers} assignments={assignments} onUpdateAssignments={setAssignments} onNext={() => setActiveStep(3)} />;
      case 3:
        return <HoursScreen workers={workers} assignments={assignments} onNext={() => setActiveStep(4)} />;
      case 4:
        return <EnviarScreen workers={workers} assignments={assignments} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (bottomTab) {
      case 'parte':
        return (
          <>
            <StepNav activeStep={activeStep} onStepChange={setActiveStep} />
            {renderParteStep()}
          </>
        );
      case 'maquinaria':
        return <MaquinariaScreen />;
      case 'tracking':
        return (
          <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-2xl mb-2">📍</p>
              <p className="text-sm font-bold mb-1">Tracking</p>
              <p className="text-xs text-muted-foreground">Seguimiento de ubicación. Próximamente.</p>
            </div>
          </div>
        );
      case 'solicitudes':
        return (
          <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm font-bold mb-1">Solicitudes</p>
              <p className="text-xs text-muted-foreground">Gestión de solicitudes. Próximamente.</p>
            </div>
          </div>
        );
      case 'historial':
        return (
          <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-2xl mb-2">🕐</p>
              <p className="text-sm font-bold mb-1">Historial</p>
              <p className="text-xs text-muted-foreground">Historial de partes enviados. Próximamente.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader notifications={1} />
      {renderContent()}
      <BottomNav activeTab={bottomTab} onTabChange={setBottomTab} />
    </div>
  );
};

export default Index;