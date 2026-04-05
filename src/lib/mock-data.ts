export interface Worker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hoursToday: number;
  status: 'working' | 'break' | 'off';
}

export interface Task {
  id: string;
  title: string;
  zone: string;
  assignedTo: string[];
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
}

export interface TimeEntry {
  id: string;
  workerId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  zone: string;
}

export interface ZoneCost {
  zone: string;
  workers: number;
  hoursTotal: number;
  costPerHour: number;
  totalCost: number;
  progress: number;
}

export const mockWorkers: Worker[] = [
  { id: '1', name: 'Carlos Ruiz', role: 'Electricista', avatar: 'CR', hoursToday: 6.5, status: 'working' },
  { id: '2', name: 'María López', role: 'Técnico solar', avatar: 'ML', hoursToday: 7, status: 'working' },
  { id: '3', name: 'Pedro Gómez', role: 'Peón', avatar: 'PG', hoursToday: 4, status: 'break' },
  { id: '4', name: 'Ana Torres', role: 'Soldador', avatar: 'AT', hoursToday: 8, status: 'off' },
  { id: '5', name: 'Luis Fernández', role: 'Electricista', avatar: 'LF', hoursToday: 5.5, status: 'working' },
  { id: '6', name: 'Elena Martín', role: 'Técnico solar', avatar: 'EM', hoursToday: 3, status: 'working' },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Instalación módulos Zona A', zone: 'Zona A', assignedTo: ['1', '2'], status: 'in-progress', priority: 'high' },
  { id: '2', title: 'Cableado DC strings', zone: 'Zona B', assignedTo: ['5'], status: 'pending', priority: 'high' },
  { id: '3', title: 'Montaje estructura', zone: 'Zona A', assignedTo: ['3', '6'], status: 'in-progress', priority: 'medium' },
  { id: '4', title: 'Soldadura soportes', zone: 'Zona C', assignedTo: ['4'], status: 'done', priority: 'low' },
  { id: '5', title: 'Revisión inversores', zone: 'Zona B', assignedTo: ['2', '5'], status: 'pending', priority: 'medium' },
];

export const mockTimeEntries: TimeEntry[] = [
  { id: '1', workerId: '1', date: '2026-04-05', clockIn: '07:00', clockOut: null, breakMinutes: 30, zone: 'Zona A' },
  { id: '2', workerId: '2', date: '2026-04-05', clockIn: '06:30', clockOut: null, breakMinutes: 30, zone: 'Zona A' },
  { id: '3', workerId: '3', date: '2026-04-05', clockIn: '07:00', clockOut: null, breakMinutes: 60, zone: 'Zona A' },
  { id: '4', workerId: '4', date: '2026-04-05', clockIn: '06:00', clockOut: '14:00', breakMinutes: 30, zone: 'Zona C' },
  { id: '5', workerId: '5', date: '2026-04-05', clockIn: '07:30', clockOut: null, breakMinutes: 0, zone: 'Zona B' },
  { id: '6', workerId: '6', date: '2026-04-05', clockIn: '08:00', clockOut: null, breakMinutes: 0, zone: 'Zona A' },
];

export const mockZoneCosts: ZoneCost[] = [
  { zone: 'Zona A - Norte', workers: 8, hoursTotal: 245, costPerHour: 22, totalCost: 5390, progress: 72 },
  { zone: 'Zona B - Central', workers: 5, hoursTotal: 180, costPerHour: 22, totalCost: 3960, progress: 45 },
  { zone: 'Zona C - Sur', workers: 4, hoursTotal: 120, costPerHour: 22, totalCost: 2640, progress: 88 },
  { zone: 'Zona D - Este', workers: 3, hoursTotal: 60, costPerHour: 22, totalCost: 1320, progress: 15 },
];
