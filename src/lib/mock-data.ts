// ── Types ──

export interface Worker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  zone: string;
  status: 'sin-fichar' | 'presente' | 'falta';
  clockIn?: string;
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

export interface Machine {
  id: string;
  name: string;
  type: string;
  operators: string[];
  task: string;
  status: 'activa' | 'averia' | 'parada';
  hoursToday: number;
  startTime?: string;
  endTime?: string;
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
  { id: '1', name: 'Juan Martinez', role: 'Operario', avatar: 'JM', zone: 'Zona A', status: 'sin-fichar' },
  { id: '2', name: 'Andres Lopez', role: 'Operario', avatar: 'AL', zone: 'Zona A', status: 'sin-fichar' },
  { id: '3', name: 'Carlos Soto', role: 'Operario', avatar: 'CS', zone: 'Zona A', status: 'sin-fichar' },
  { id: '4', name: 'Diego Vargas', role: 'Operario', avatar: 'DV', zone: 'Zona A', status: 'sin-fichar' },
  { id: '5', name: 'Pedro Ruiz', role: 'Operario', avatar: 'PR', zone: 'Zona A', status: 'sin-fichar' },
  { id: '6', name: 'Miguel Garcia', role: 'Operario', avatar: 'MG', zone: 'Zona A', status: 'sin-fichar' },
  { id: '7', name: 'Ernesto Blanco', role: 'Operario', avatar: 'EB', zone: 'Zona A', status: 'sin-fichar' },
  { id: '8', name: 'Fernando Torres', role: 'Operario', avatar: 'FT', zone: 'Zona A', status: 'sin-fichar' },
  { id: '9', name: 'Roberto Mora', role: 'Operario', avatar: 'RM', zone: 'Zona A', status: 'sin-fichar' },
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

export const mockMachines: Machine[] = [
  { id: 'm1', name: 'Manitou Telescopico 17M', type: 'telescopico', operators: ['1', '3'], task: 'Hincado principal', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm2', name: 'JCB 540-170 17M', type: 'telescopico', operators: ['2'], task: 'Lima y pintura', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm3', name: 'JCB 535-125 12M', type: 'telescopico', operators: ['4', '5'], task: 'Micropilotes emplantillado', status: 'averia', hoursToday: 0 },
  { id: 'm4', name: 'Carretilla Elevadora JCB', type: 'carretilla', operators: [], task: 'Logistica', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm5', name: 'Bobcat TL 35.70 7M', type: 'telescopico', operators: ['6'], task: 'Modulos - Plantillas', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm6', name: 'Manitou 6M MT625H (1)', type: 'telescopico', operators: [], task: 'Estructura', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm7', name: 'Manitou 6M MT625H (2)', type: 'telescopico', operators: ['7'], task: 'Estructura', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm8', name: 'Grua Torre Liebherr 65K', type: 'grua', operators: ['8'], task: 'Montaje cabezales', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm9', name: 'Dumper Ausa 6T', type: 'dumper', operators: [], task: 'Repartos Piezeno', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm10', name: 'Mini Excavadora JCB', type: 'excavadora', operators: ['9'], task: 'Micropilotes hormigonado', status: 'activa', hoursToday: 8.75, startTime: '07:00', endTime: '15:45' },
  { id: 'm11', name: 'Plataforma Elevadora Haulotte', type: 'plataforma', operators: [], task: 'Calidad estructura', status: 'parada', hoursToday: 0 },
  { id: 'm12', name: 'Rodillo Compactador Bomag', type: 'rodillo', operators: [], task: 'Varios', status: 'parada', hoursToday: 0 },
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