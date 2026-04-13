import { useState } from "react";
import { isToday as isTodayFn, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { mockWorkers as initialWorkers, mockMachines as initialMachines, mockTransferRequests, Worker, Machine, TransferRequest, TransferStatus } from "@/lib/mock-data";
import type { Incident } from "@/components/MaquinariaScreen";
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
import SolicitudesPanel, { type OutgoingRequest } from "@/components/SolicitudesPanel";
import HistorialScreen from "@/components/HistorialScreen";
import LoginScreen from "@/components/LoginScreen";
import RendimientosScreen from "@/components/RendimientosScreen";

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
  rendimientos: 'Rendimientos · PSFV San Pedro',
  solicitudes: 'Solicitudes de operarios',
  historial: 'Historial de partes',
};

const generatePastWorkers = (): Worker[] => {
  return initialWorkers.map(w => ({
    ...w,
    status: Math.random() > 0.15 ? 'presente' as const : 'falta' as const,
    clockIn: Math.random() > 0.15 ? `07:0${Math.floor(Math.random() * 9)}` : undefined,
    faltaMotivo: Math.random() > 0.15 ? undefined : 'Enfermedad' as const,
  }));
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([
    { id: 'out1', workerName: 'Pedro Ruiz', toZone: 'Zona B · Estructura', toActivity: 'Estructura', requestedAt: '08:45', status: 'pending' },
  ]);

  // Incidencia pre-fill state
  const [incidenciaPreFill, setIncidenciaPreFill] = useState<{ name: string; tab: 'maquinaria' | 'flota' } | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const handleAddOutgoing = (req: OutgoingRequest) => {
    setOutgoingRequests(prev => [req, ...prev]);
  };

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
    if (isToday) setActiveStep(1);
  };

  const handleReportIncidencia = (machineName: string, category: 'maquinaria' | 'flota') => {
    setIncidenciaPreFill({ name: machineName, tab: category });
    setBottomTab('incidencias');
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderParteStep = () => {
    if (!isEditableDay) {
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
                <p className="text-[18px] font-bold" style={{ color: 'hsl(var(--teal))' }}>{presentes}</p>
                <p className="text-[10px] text-muted-foreground">Presentes</p>
              </div>
              <div className="stat-card text-center py-2">
                <p className="text-[18px] font-bold" style={{ color: 'hsl(var(--teal))' }}>{currentWorkers.filter(w => w.status === 'falta').length}</p>
                <p className="text-[10px] text-muted-foreground">Faltas</p>
              </div>
              <div className="stat-card text-center py-2">
                <p className="text-[18px] font-bold" style={{ color: 'hsl(var(--teal))' }}>{currentAssignments.length}</p>
                <p className="text-[10px] text-muted-foreground">Actividades</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-[10px] p-3">
            <p className="text-[12px] font-bold mb-2">Operarios</p>
            <div className="space-y-1.5">
              {currentWorkers.map(w => (
                <div key={w.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl" style={{ background: 'hsl(var(--teal-bg))' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'hsl(var(--teal))' }}>{w.avatar}</div>
                    <span className="text-[12px] font-medium">{w.name}</span>
                  </div>
                  <span className={`pill ${w.status === 'presente' ? 'pill-ok' : 'pill-danger'}`}>
                    {w.status === 'presente' ? `✓ ${w.clockIn}` : '✕ Falta'}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
        return <MaquinariaStepScreen machines={machines} onUpdateMachines={setMachines} onNext={() => setActiveStep(5)} onReportIncidencia={handleReportIncidencia} />;
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
        return <MaquinariaScreen machines={machines} onUpdateMachines={setMachines} preFill={incidenciaPreFill} onClearPreFill={() => setIncidenciaPreFill(null)} incidents={incidents} onUpdateIncidents={setIncidents} />;
      case 'tracking':
        return <TrackingScreen visible={bottomTab === 'tracking'} />;
      case 'solicitudes':
        return <SolicitudesPanel transfers={transfers} onUpdateStatus={handleUpdateTransferStatus} outgoingRequests={outgoingRequests} onAddOutgoing={handleAddOutgoing} />;
      case 'rendimientos':
        return <RendimientosScreen workers={workers} assignments={assignments} hoursMap={hoursMap} productionMap={productionMap} machines={machines} />;
      case 'historial':
        return <HistorialScreen />;
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
      {!isEditableDay && bottomTab === 'parte' && (
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ background: 'hsl(var(--amber-bg))', color: 'hsl(var(--amber-text))' }}>
          <span className="text-[12px] font-bold">🔒 Visualizando día anterior — solo lectura</span>
          <button onClick={() => handleSelectDate(new Date(), true)} className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: 'hsl(var(--teal))', color: '#fff' }}>Ir a hoy</button>
        </div>
      )}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', padding: '12px 14px', paddingBottom: 'calc(var(--nav-height, 60px) + 16px)' }}>
          {renderContent()}
        </div>
      </div>
      {bottomTab === 'parte' && activeStep === 1 && isEditableDay && (
        <div className="flex-shrink-0 px-3.5 pt-2 pb-1" style={{ background: 'hsl(var(--background))' }}>
          <button onClick={() => setActiveStep(2)} className="sbtn"
            style={{ opacity: presentes > 0 ? 1 : 0.6 }} disabled={presentes === 0}>
            Continuar → Asignar tareas
            <span className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: 'rgba(255,255,255,.2)' }}>{presentes} pres.</span>
          </button>
        </div>
      )}
      <BottomNav activeTab={bottomTab} onTabChange={setBottomTab} pendingCount={pendingTransfers} incidentCount={incidents.filter(i => i.status === 'activa').length} />
    </div>
  );
};

export default Index;
