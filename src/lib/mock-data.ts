// ── Types ──

export type FaltaMotivo = 'Sin avisar' | 'Enfermedad' | 'Permiso' | 'Retraso';
export type WorkerTipo = 'DESP' | 'LOCAL' | 'FIELD';

export interface Worker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  zone: string;
  tipo: WorkerTipo;
  status: 'sin-fichar' | 'presente' | 'falta';
  clockIn?: string;
  faltaMotivo?: FaltaMotivo;
}

export interface Zone {
  id: string;
  name: string;
  activity: string;
  workers: string[]; // worker IDs
}

export interface Activity {
  id: string;
  name: string;
  zone: string;
  assignedWorkers: string[];
}

export interface Subtask {
  id: string;
  name: string;
  standardHours: number; // hours per worker for this subtask
}

export interface ActivityWithSubtasks {
  name: string;
  subtasks: Subtask[];
}

export type MachineCategory = 'maquinaria' | 'flota';

export interface Machine {
  id: string;
  name: string;
  type: string;
  category: MachineCategory;
  operators: string[];
  task: string;
  status: 'activa' | 'averia' | 'parada';
  hoursToday: number;
  startTime?: string;
  endTime?: string;
}

export type TransferStatus = 'pending' | 'approved' | 'rejected';

export interface TransferRequest {
  id: string;
  workerId: string;
  workerName: string;
  fromZone: string;
  toZone: string;
  fromActivity: string;
  toActivity: string;
  requestedBy: string;   // foreman name
  requestedAt: string;   // time string
  status: TransferStatus;
  hoursBeforeTransfer: number;
  hoursAfterTransfer: number;
}

export interface DailyReport {
  date: string;
  foreman: string;
  project: string;
  presentWorkers: number;
  totalHH: number;
  deviation: number;
  extraCost: number;
  comments: string;
}

// ── Data ──

export const projectInfo = {
  name: 'PSFV San Pedro',
  foreman: 'Pepe Cabrerizo',
  role: 'Capataz',
  date: '31/03/26',
  dayOfWeek: 'Martes',
};

export const mockWorkers: Worker[] = [
  { id: '1', name: 'Juan Martinez', role: 'Operario', avatar: 'JM', zone: 'Zona A', tipo: 'FIELD', status: 'sin-fichar' },
  { id: '2', name: 'Andres Lopez', role: 'Operario', avatar: 'AL', zone: 'Zona A', tipo: 'FIELD', status: 'sin-fichar' },
  { id: '3', name: 'Carlos Soto', role: 'Operario', avatar: 'CS', zone: 'Zona A', tipo: 'LOCAL', status: 'sin-fichar' },
  { id: '4', name: 'Diego Vargas', role: 'Operario', avatar: 'DV', zone: 'Zona A', tipo: 'DESP', status: 'sin-fichar' },
  { id: '5', name: 'Pedro Ruiz', role: 'Operario', avatar: 'PR', zone: 'Zona A', tipo: 'DESP', status: 'sin-fichar' },
  { id: '6', name: 'Miguel Garcia', role: 'Operario', avatar: 'MG', zone: 'Zona A', tipo: 'LOCAL', status: 'sin-fichar' },
  { id: '7', name: 'Ernesto Blanco', role: 'Operario', avatar: 'EB', zone: 'Zona A', tipo: 'FIELD', status: 'sin-fichar' },
  { id: '8', name: 'Fernando Torres', role: 'Operario', avatar: 'FT', zone: 'Zona A', tipo: 'FIELD', status: 'sin-fichar' },
  { id: '9', name: 'Roberto Mora', role: 'Operario', avatar: 'RM', zone: 'Zona A', tipo: 'LOCAL', status: 'sin-fichar' },
];

export const mockZones: Zone[] = [
  { id: 'z1', name: 'Zona A', activity: 'Hincado', workers: ['1', '2', '3', '4', '5', '6'] },
  { id: 'z2', name: 'Zona A', activity: 'Micropilotes', workers: ['7', '8', '9'] },
];

export const mockActivities: string[] = [
  'Hincado principal',
  'Lima y pintura',
  'Micropilotes emplantillado',
  'Micropilotes hormigonado',
  'Reparto de hincas',
  'Corte y mecanizado',
  'POT',
  'Cableado Motora',
  'Laser',
  'Repartos Piezeno',
  'Montaje cabezales',
  'Montaje motora',
  'Montaje tubo torque',
  'Calidad estructura',
  'Limpieza estructura',
  'Soldado montaje',
  'Almacenero',
  'Logistica',
  'Estructura',
  'Modulos',
  'Varios',
];

export const mockActivitySubtasks: Record<string, Subtask[]> = {
  'Hincado principal': [
    { id: 'hp1', name: 'Preparación terreno', standardHours: 2 },
    { id: 'hp2', name: 'Hincado micropilotes', standardHours: 4 },
    { id: 'hp3', name: 'Revisión', standardHours: 2.75 },
  ],
  'Lima y pintura': [
    { id: 'lp1', name: 'Lijado superficies', standardHours: 3 },
    { id: 'lp2', name: 'Aplicación pintura', standardHours: 4 },
    { id: 'lp3', name: 'Secado y revisión', standardHours: 1.75 },
  ],
  'Micropilotes emplantillado': [
    { id: 'me1', name: 'Colocación plantillas', standardHours: 3 },
    { id: 'me2', name: 'Nivelación', standardHours: 2.5 },
    { id: 'me3', name: 'Fijación', standardHours: 3.25 },
  ],
  'Micropilotes hormigonado': [
    { id: 'mh1', name: 'Preparación encofrado', standardHours: 2.5 },
    { id: 'mh2', name: 'Vertido hormigón', standardHours: 3 },
    { id: 'mh3', name: 'Vibrado y curado', standardHours: 3.25 },
  ],
  'Estructura': [
    { id: 'es1', name: 'Montaje perfiles', standardHours: 4 },
    { id: 'es2', name: 'Soldadura', standardHours: 3 },
    { id: 'es3', name: 'Revisión calidad', standardHours: 1.75 },
  ],
  'Montaje cabezales': [
    { id: 'mc1', name: 'Preparación piezas', standardHours: 2 },
    { id: 'mc2', name: 'Montaje', standardHours: 4.5 },
    { id: 'mc3', name: 'Apriete y verificación', standardHours: 2.25 },
  ],
};

// Default subtasks for activities not explicitly listed
export const defaultSubtasks: Subtask[] = [
  { id: 'def1', name: 'Trabajo general', standardHours: 6 },
  { id: 'def2', name: 'Limpieza y recogida', standardHours: 2.75 },
];

export const mockMachines: Machine[] = [
  // MAQUINARIA
  { id: 'm1', name: 'Manipulador Telescopico Manitou 17M', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm2', name: 'Manipulador Telescopico JCB 540-170 17M', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm3', name: 'Manipulador Telescopico JCB 535-125 12M', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm4', name: 'Carretilla Elevadora JCB', type: 'carretilla', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm5', name: 'Manipulador Telescopico Bobcat TL 35.70 7M', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm6', name: 'Manipulador Telescopico Manitou 6M MT625H', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm7', name: 'Manipulador Telescopico Manitou 13M MT1335 (1)', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm8', name: 'Manipulador Telescopico Manitou 13M MT1335 (2)', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm9', name: 'Manipulador Telescopico Manitou 6M MT625H (2)', type: 'telescopico', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm10', name: 'Tractor Kubota M6-121', type: 'tractor', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm11', name: 'Plataforma Agrimeca', type: 'plataforma', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'm12', name: 'Hincadora Turchi', type: 'hincadora', category: 'maquinaria', operators: [], task: '', status: 'parada', hoursToday: 0 },
  // FLOTA
  { id: 'f1', name: 'Renault Trafic', type: 'furgoneta', category: 'flota', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'f2', name: 'Ford Transit', type: 'furgoneta', category: 'flota', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'f3', name: 'Seat Ateca', type: 'turismo', category: 'flota', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'f4', name: 'Iveco Daily', type: 'furgoneta', category: 'flota', operators: [], task: '', status: 'parada', hoursToday: 0 },
  { id: 'f5', name: 'Citroen Jumper', type: 'furgoneta', category: 'flota', operators: [], task: '', status: 'parada', hoursToday: 0 },
];

export const mockTransferRequests: TransferRequest[] = [
  {
    id: 'tr1',
    workerId: '3',
    workerName: 'Carlos Soto',
    fromZone: 'Zona A · Hincado',
    toZone: 'Zona B · Estructura',
    fromActivity: 'Hincado principal',
    toActivity: 'Estructura',
    requestedBy: 'Manuel Reyes',
    requestedAt: '09:30',
    status: 'pending',
    hoursBeforeTransfer: 3,
    hoursAfterTransfer: 5,
  },
  {
    id: 'tr2',
    workerId: '7',
    workerName: 'Ernesto Blanco',
    fromZone: 'Zona A · Micropilotes',
    toZone: 'Zona C · Módulos',
    fromActivity: 'Micropilotes emplantillado',
    toActivity: 'Modulos',
    requestedBy: 'Luis Fernandez',
    requestedAt: '10:15',
    status: 'pending',
    hoursBeforeTransfer: 2.5,
    hoursAfterTransfer: 5.5,
  },
];

export const mockReport: DailyReport = {
  date: '31/03/2026',
  foreman: 'Pepe Cabrerizo',
  project: 'PSFV San Pedro',
  presentWorkers: 0,
  totalHH: 0,
  deviation: 0,
  extraCost: 0,
  comments: 'Hormigón: 10m³ = 39 ud. Hay que recevar.',
};
