import { useState } from "react";
import { isToday as isTodayFn, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { mockWorkers as initialWorkers, mockMachines as initialMachines, mockTransferRequests, Worker, Machine, TransferRequest, TransferStatus } from "@/lib/mock-data";
import AppHeader from "@/components/AppHeader";
import StepNav from "@/components/StepNav";
import FichajeScreen from "@/components/FichajeScreen";
import AsignacionesScreen from "@/components/AsignacionesScreen";
import HoursScreen from "@/components/HoursScreen";
import EnviarScreen from "@/components/EnviarScreen";
import MaquinariaStepScreen from "@/components/MaquinariaStepScreen";
import MaquinariaScreen from "@/components/MaquinariaScreen";
import TrackingScreen from "@/components/TrackingScreen";
import BottomNav from "@/components/BottomNav";
import SolicitudesPanel from "@/components/SolicitudesPanel";

interface Assignment {
  activity: string;
  workerIds: string[];
  comment?: string;
}

interface TaskProduction {
  horaInicio: string;
  horaFin: string;
  udsProd: string;
  tipo: string;
}

const navLabels: Record<string, string> = {
  parte: 'Pepe Cabrerizo · Capataz',
  incidencias: 'Incidencias de maquinaria',
  tracking: 'Tracking GPS · PSFV San Pedro',
  solicitudes: 'Solicitudes de operarios',
  historial: 'Historial de partes',
};

// Generate dummy past-day workers (random statuses, already filed)
const generatePastWorkers = (): Worker[] => {
  return initialWorkers.map(w => ({
    ...w,
    status: Math.random() > 0.15 ? 'presente' as const : 'falta' as const,
    clockIn: Math.random() > 0.15 ? `07:0${Math.floor(Math.random() * 9)}` : undefined,
    faltaMotivo: Math.random() > 0.15 ? undefined : 'Enfermedad' as const,
  }));
};

const Index = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [bottomTab, setBottomTab] = useState('parte');
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [hoursMap, setHoursMap] = useState<Record<string, number>>({});
  const [previstasMap, setPrevistasMap] = useState<Record<string, number>>({});
  const [productionMap, setProductionMap] = useState<Record<string, TaskProduction>>({});
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditableDay, setIsEditableDay] = useState(true);
  const [transfers, setTransfers] = useState<TransferRequest[]>(mockTransferRequests);
  const [outgoingRequests, setOutgoingRequests] = useState<{ id: string; workerName: string; toZone: string; toActivity: string; requestedAt: string; status: TransferStatus }[]>([
    { id: 'out1', workerName: 'Pedro Ruiz', toZone: 'Zona B · Estructura', toActivity: 'Estructura', requestedAt: '08:45', status: 'pending' },
  ]);

  const handleAddOutgoing = (req: { id: string; workerName: string; toZone: string; toActivity: string; requestedAt: string; status: TransferStatus }) => {
    setOutgoingRequests(prev => [req, ...prev]);
  };

  // Past day snapshots
  const [pastWorkers] = useState<Worker[]>(generatePastWorkers);
  const [pastAssignments] = useState<Assignment[]>([
    { activity: 'Hincado principal', workerIds: ['1', '2', '3'] },
    { activity: 'Lima y pintura', workerIds: ['4', '5'] },
    { activity: 'Micropilotes emplantillado', workerIds: ['6', '7'] },
  ]);

  const currentWorkers = isEditableDay ? workers : pastWorkers;
  const currentAssignments = isEditableDay ? assignments : pastAssignments;
  const presentes = currentWorkers.filter(w => w.status === 'presente').length;
  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;

  const handleUpdateTransferStatus = (id: string, status: TransferStatus) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleSelectDate = (date: Date, isToday: boolean) => {
    setSelectedDate(date);
    setIsEditableDay(isToday);
    if (isToday) {
      setActiveStep(1);
    }
  };

  const renderParteStep = () => {
    if (!isEditableDay) {
      // Read-only view for past days
      return (
        <div className="space-y-3">
          <div className="glass-card rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-[13px] font-bold">Parte del {format(selectedDate, "dd/MM/yy")}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{format(selectedDate, "EEEE", { locale: es })} — Solo lectura</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="stat-card text-center py-2">
                <p className="text-[18px] font-bold" style={{ color: 'hsl(var(--g4))' }}>{presentes}</p>
                <p className="text-[10px] text-muted-foreground">Presentes</p>
              </div>
              <div className="stat-card text-center py-2">
                <p className="text-[18px] font-bold" style={{ color: 'hsl(var(--g4))' }}>{currentWorkers.filter(w => w.status === 'falta').length}</p>
                <p className="text-[10px] text-muted-foreground">Faltas</p>
              </div>
              <div className="stat-card text-center py-2">
                <p className="text-[18px] font-bold" style={{ color: 'hsl(var(--g4))' }}>{currentAssignments.length}</p>
                <p className="text-[10px] text-muted-foreground">Actividades</p>
              </div>
            </div>
          </div>

          {/* Workers list read-only */}
          <div className="glass-card rounded-[10px] p-3">
            <p className="text-[12px] font-bold mb-2">Operarios</p>
            <div className="space-y-1.5">
              {currentWorkers.map(w => (
                <div key={w.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'hsl(var(--g05))' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'hsl(var(--g6))' }}>{w.avatar}</div>
                    <span className="text-[12px] font-medium">{w.name}</span>
                  </div>
                  <span className={`pill ${w.status === 'presente' ? 'pill-ok' : 'pill-danger'}`}>
                    {w.status === 'presente' ? `✓ ${w.clockIn}` : '✕ Falta'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments read-only */}
          {currentAssignments.length > 0 && (
            <div className="glass-card rounded-[10px] p-3">
              <p className="text-[12px] font-bold mb-2">Asignaciones</p>
              <div className="space-y-2">
                {currentAssignments.map((a, i) => (
                  <div key={i} className="py-2 px-2.5 rounded-lg border border-border">
                    <p className="text-[12px] font-bold mb-1">{a.activity}</p>
                    <p className="text-[10px] text-muted-foreground">{a.workerIds.length} operarios asignados</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (activeStep) {
      case 1:
        return <FichajeScreen workers={workers} onUpdateWorkers={setWorkers} onNext={() => setActiveStep(2)} />;
      case 2:
        return <AsignacionesScreen workers={workers} assignments={assignments} onUpdateAssignments={setAssignments} transfers={transfers} onNext={() => setActiveStep(3)} />;
      case 3:
        return <HoursScreen workers={workers} assignments={assignments} hoursMap={hoursMap} onUpdateHoursMap={setHoursMap} previstasMap={previstasMap} onUpdatePrevistasMap={setPrevistasMap} productionMap={productionMap} onUpdateProductionMap={setProductionMap} transfers={transfers} onNext={() => setActiveStep(4)} />;
      case 4:
        return <MaquinariaStepScreen machines={machines} onUpdateMachines={setMachines} onNext={() => setActiveStep(5)} />;
      case 5:
        return <EnviarScreen workers={workers} assignments={assignments} hoursMap={hoursMap} productionMap={productionMap} machines={machines} transfers={transfers} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (bottomTab) {
      case 'parte':
        return renderParteStep();
      case 'incidencias':
        return <MaquinariaScreen machines={machines} onUpdateMachines={setMachines} />;
      case 'tracking':
        return <TrackingScreen visible={bottomTab === 'tracking'} />;
      case 'solicitudes':
        return <SolicitudesPanel transfers={transfers} onUpdateStatus={handleUpdateTransferStatus} />;
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
        notifications={pendingTransfers}
        activeStep={bottomTab === 'parte' ? activeStep : undefined}
        headerSub={navLabels[bottomTab]}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        transfers={transfers}
        onUpdateTransferStatus={handleUpdateTransferStatus}
      />

      {bottomTab === 'parte' && isEditableDay && (
        <StepNav activeStep={activeStep} onStepChange={setActiveStep} />
      )}

      {/* Read-only banner */}
      {!isEditableDay && bottomTab === 'parte' && (
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ background: '#f6ad55', color: '#744210' }}>
          <span className="text-[12px] font-bold">🔒 Visualizando día anterior — solo lectura</span>
          <button
            onClick={() => handleSelectDate(new Date(), true)}
            className="text-[11px] font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,.15)' }}
          >
            Ir a hoy
          </button>
        </div>
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

      {/* Continue button for step 1 - only on today */}
      {bottomTab === 'parte' && activeStep === 1 && isEditableDay && (
        <div className="flex-shrink-0 px-3.5 pt-2 pb-1" style={{ background: 'hsl(var(--background))' }}>
          <button
            onClick={() => setActiveStep(2)}
            className="w-full py-3.5 rounded-xl border-none text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2.5"
            style={{
              background: '#0f1f3a',
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

      <BottomNav activeTab={bottomTab} onTabChange={setBottomTab} pendingCount={pendingTransfers} />
    </div>
  );
};

export default Index;
