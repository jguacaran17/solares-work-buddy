import { useState } from "react";
import { mockWorkers as initialWorkers, Worker } from "@/lib/mock-data";
import AppHeader from "@/components/AppHeader";
import StepNav from "@/components/StepNav";
import FichajeScreen from "@/components/FichajeScreen";
import AsignacionesScreen from "@/components/AsignacionesScreen";
import HoursScreen from "@/components/HoursScreen";
import EnviarScreen from "@/components/EnviarScreen";
import MaquinariaScreen from "@/components/MaquinariaScreen";
import BottomNav from "@/components/BottomNav";

interface Assignment {
  activity: string;
  workerIds: string[];
}

const navLabels: Record<string, string> = {
  parte: 'Pepe Cabrerizo · Capataz',
  maquinaria: 'Maquinaria',
  tracking: 'Tracking GPS · PSFV San Pedro',
  solicitudes: 'Solicitudes de operarios',
  historial: 'Historial de partes',
};

const Index = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [bottomTab, setBottomTab] = useState('parte');
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const presentes = workers.filter(w => w.status === 'presente').length;

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
        return renderParteStep();
      case 'maquinaria':
        return <MaquinariaScreen />;
      case 'tracking':
        return (
          <div className="glass-card rounded-[10px] p-6 text-center">
            <p className="text-2xl mb-2">📍</p>
            <p className="text-sm font-bold mb-1">Tracking GPS</p>
            <p className="text-xs text-muted-foreground">Seguimiento de ubicación. Próximamente.</p>
          </div>
        );
      case 'solicitudes':
        return (
          <div className="glass-card rounded-[10px] p-6 text-center">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm font-bold mb-1">Solicitudes</p>
            <p className="text-xs text-muted-foreground">Gestión de solicitudes. Próximamente.</p>
          </div>
        );
      case 'historial':
        return (
          <div className="glass-card rounded-[10px] p-6 text-center">
            <p className="text-2xl mb-2">🕐</p>
            <p className="text-sm font-bold mb-1">Historial</p>
            <p className="text-xs text-muted-foreground">Historial de partes enviados. Próximamente.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader
        notifications={1}
        activeStep={bottomTab === 'parte' ? activeStep : undefined}
        headerSub={navLabels[bottomTab]}
      />

      {bottomTab === 'parte' && (
        <StepNav activeStep={activeStep} onStepChange={setActiveStep} />
      )}

      {/* Scrollable content area */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            padding: '12px 14px',
            paddingBottom: 'calc(var(--nav-height, 60px) + 16px)',
          }}
        >
          {renderContent()}
        </div>
      </div>

      {/* Continue button for step 1 */}
      {bottomTab === 'parte' && activeStep === 1 && (
        <div className="flex-shrink-0 px-3.5 pt-2 pb-1" style={{ background: 'hsl(var(--background))' }}>
          <button
            onClick={() => setActiveStep(2)}
            className="w-full py-3.5 rounded-xl border-none text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2.5"
            style={{
              background: 'hsl(var(--g8))',
              color: '#fff',
              opacity: presentes > 0 ? 1 : 0.6,
            }}
            disabled={presentes === 0}
          >
            Continuar → Asignar tareas
            <span className="rounded-[20px] px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: 'rgba(255,255,255,.2)' }}>
              {presentes} pres.
            </span>
          </button>
        </div>
      )}

      <BottomNav activeTab={bottomTab} onTabChange={setBottomTab} />
    </div>
  );
};

export default Index;
