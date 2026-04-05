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
  const [bottomTab, setBottomTab] = useState('maquinaria');
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <FichajeScreen
            workers={workers}
            onUpdateWorkers={setWorkers}
            onNext={() => setActiveStep(2)}
          />
        );
      case 2:
        return (
          <AsignacionesScreen
            workers={workers}
            assignments={assignments}
            onUpdateAssignments={setAssignments}
            onNext={() => setActiveStep(3)}
          />
        );
      case 3:
        return (
          <HoursScreen
            workers={workers}
            assignments={assignments}
            onNext={() => setActiveStep(4)}
          />
        );
      case 4:
        return (
          <EnviarScreen
            workers={workers}
            assignments={assignments}
          />
        );
      default:
        return null;
    }
  };

  const renderBottomContent = () => {
    switch (bottomTab) {
      case 'maquinaria':
        return <MaquinariaScreen />;
      case 'flota':
        return <FlotaScreen />;
      case 'incidencias':
        return <IncidenciasScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader notifications={1} />
      <StepNav activeStep={activeStep} onStepChange={setActiveStep} />

      {/* Main step content */}
      <div className="flex-1">
        {renderStep()}
      </div>

      {/* Separator */}
      <div className="border-t-4 border-border" />

      {/* Bottom section */}
      <div className="flex-1">
        {renderBottomContent()}
      </div>

      <BottomNav activeTab={bottomTab} onTabChange={setBottomTab} />
    </div>
  );
};

export default Index;