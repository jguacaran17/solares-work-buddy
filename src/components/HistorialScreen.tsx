import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type Period = "hoy" | "semana" | "mes" | "todo";
type Section = "partes" | "maquinaria" | "flota" | "produccion" | "ranking";

const PERIOD_LABELS: Record<Period, string> = { hoy: "Hoy", semana: "Semana", mes: "Mes", todo: "Todo" };
const PERIOD_DIVISORS: Record<Period, number> = { hoy: 120, semana: 24, mes: 5.5, todo: 1 };

const Spark = ({ values, color }: { values: number[]; color: string }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 48, h = 18;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="inline-block ml-1">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const KPI = ({ label, value, spark, sparkColor = "hsl(var(--teal))" }: {
  label: string; value: string | number; spark?: number[]; sparkColor?: string;
}) => (
  <div className="stat-card flex flex-col gap-0.5">
    <div className="kmi-label">{label}</div>
    <div className="flex items-end gap-1">
      <span className="kmi-value text-[18px]">{value}</span>
      {spark && <Spark values={spark} color={sparkColor} />}
    </div>
  </div>
);

// Badge components
const DespBadge = () => <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ background: 'hsl(var(--badge-desp-bg))', color: 'hsl(var(--badge-desp-text))' }}>DESP</span>;
const LocBadge = () => <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ background: 'hsl(var(--badge-loc-bg))', color: 'hsl(var(--badge-loc-text))' }}>LOC</span>;
const FldBadge = () => <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ background: 'hsl(var(--badge-fld-bg))', color: 'hsl(var(--badge-fld-text))' }}>FLD</span>;

// ═══ PARTES DATA ═══
const PARTES_LIST = [
  { date: "2026-04-04", capataz: "Álvarez, R.", operarios: 18, hh: 144, desv: 0,
    subtareas: [
      { name: "Hincado", zone: "Zona A", hhReal: 52, hhTeo: 48, responsible: "Álvarez, R." },
      { name: "Montaje estructura", zone: "Zona B", hhReal: 44, hhTeo: 45, responsible: "García, J." },
      { name: "Conexionado", zone: "Zona A", hhReal: 48, hhTeo: 51, responsible: "López, M." },
    ]},
  { date: "2026-04-03", capataz: "Gómez, P.", operarios: 22, hh: 198, desv: 12,
    subtareas: [
      { name: "Hincado", zone: "Zona C", hhReal: 78, hhTeo: 66, responsible: "Gómez, P." },
      { name: "Soldadura marcos", zone: "Zona B", hhReal: 65, hhTeo: 60, responsible: "Fernández, A." },
      { name: "Micropilotes", zone: "Zona A", hhReal: 55, hhTeo: 52, responsible: "Gómez, P." },
    ]},
  { date: "2026-04-02", capataz: "Álvarez, R.", operarios: 20, hh: 180, desv: -5,
    subtareas: [
      { name: "Lima y pintura", zone: "Zona B", hhReal: 60, hhTeo: 64, responsible: "Ruiz, P." },
      { name: "Perforación", zone: "Zona A", hhReal: 58, hhTeo: 60, responsible: "Álvarez, R." },
      { name: "Montaje cabezales", zone: "Zona C", hhReal: 62, hhTeo: 66, responsible: "Álvarez, R." },
    ]},
  { date: "2026-04-01", capataz: "Martínez, L.", operarios: 16, hh: 128, desv: 8,
    subtareas: [
      { name: "Hincado", zone: "Zona B", hhReal: 50, hhTeo: 44, responsible: "Martínez, L." },
      { name: "Estructura", zone: "Zona A", hhReal: 42, hhTeo: 40, responsible: "García, J." },
      { name: "Varios", zone: "Zona C", hhReal: 36, hhTeo: 34, responsible: "Martínez, L." },
    ]},
  { date: "2026-03-31", capataz: "Gómez, P.", operarios: 24, hh: 216, desv: 0,
    subtareas: [
      { name: "Trackers", zone: "Zona A", hhReal: 72, hhTeo: 72, responsible: "López, M." },
      { name: "Módulos", zone: "Zona B", hhReal: 68, hhTeo: 70, responsible: "Gómez, P." },
      { name: "Hincado", zone: "Zona C", hhReal: 76, hhTeo: 74, responsible: "Fernández, A." },
    ]},
  { date: "2026-03-28", capataz: "Álvarez, R.", operarios: 19, hh: 171, desv: -3,
    subtareas: [
      { name: "Micropilotes", zone: "Zona A", hhReal: 88, hhTeo: 90, responsible: "Álvarez, R." },
      { name: "Conexionado", zone: "Zona B", hhReal: 83, hhTeo: 84, responsible: "Ruiz, P." },
    ]},
  { date: "2026-03-27", capataz: "Martínez, L.", operarios: 21, hh: 189, desv: 15,
    subtareas: [
      { name: "Soldadura marcos", zone: "Zona C", hhReal: 100, hhTeo: 82, responsible: "Martínez, L." },
      { name: "Perforación", zone: "Zona A", hhReal: 89, hhTeo: 80, responsible: "Martínez, L." },
    ]},
  { date: "2026-03-26", capataz: "Gómez, P.", operarios: 17, hh: 153, desv: 6,
    subtareas: [
      { name: "Lima y pintura", zone: "Zona B", hhReal: 80, hhTeo: 74, responsible: "Gómez, P." },
      { name: "Varios", zone: "Zona A", hhReal: 73, hhTeo: 70, responsible: "García, J." },
    ]},
];
const PARTES_CHART_DATA = [
  { day: "Lun", hh: 144 }, { day: "Mar", hh: 198 }, { day: "Mié", hh: 180 },
  { day: "Jue", hh: 128 }, { day: "Vie", hh: 216 }, { day: "Sáb", hh: 72 }, { day: "Dom", hh: 0 },
];

// ═══ MAQUINARIA DATA ═══
const MACHINES = [
  { name: "Hincadora CAT-350", avail: 92, hhWorked: 1840, hhLost: 160, daysActive: 210, incidents: 3 },
  { name: "Grúa Liebherr LTM", avail: 88, hhWorked: 1760, hhLost: 240, daysActive: 195, incidents: 5 },
  { name: "Retroexcav. JCB", avail: 95, hhWorked: 1900, hhLost: 100, daysActive: 225, incidents: 2 },
  { name: "Perforadora Bauer", avail: 78, hhWorked: 1560, hhLost: 440, daysActive: 180, incidents: 8 },
  { name: "Manipuladora Merlo", avail: 97, hhWorked: 1940, hhLost: 60, daysActive: 230, incidents: 1 },
  { name: "Camión grúa Hiab", avail: 85, hhWorked: 1700, hhLost: 300, daysActive: 200, incidents: 4 },
];
const INCIDENTS = [
  { machine: "Perforadora Bauer", date: "2026-04-03", duration: "6h", status: "activa" as const },
  { machine: "Grúa Liebherr LTM", date: "2026-04-01", duration: "4h", status: "resuelta" as const },
  { machine: "Camión grúa Hiab", date: "2026-03-28", duration: "8h", status: "resuelta" as const },
  { machine: "Hincadora CAT-350", date: "2026-03-25", duration: "3h", status: "resuelta" as const },
  { machine: "Perforadora Bauer", date: "2026-03-20", duration: "12h", status: "resuelta" as const },
];

// ═══ FLOTA DATA ═══
const VEHICLES = [
  { plate: "3821-PLK", kmStart: 45230, kmEnd: 45312, kmDay: 82, daysUsed: 190, incidents: 2 },
  { plate: "8432-BKM", kmStart: 32100, kmEnd: 32178, kmDay: 78, daysUsed: 210, incidents: 1 },
  { plate: "1245-GHT", kmStart: 67890, kmEnd: 67945, kmDay: 55, daysUsed: 175, incidents: 3 },
  { plate: "9087-XCV", kmStart: 21340, kmEnd: 21412, kmDay: 72, daysUsed: 220, incidents: 0 },
  { plate: "5643-MNP", kmStart: 89100, kmEnd: 89188, kmDay: 88, daysUsed: 205, incidents: 4 },
];

// ═══ PRODUCCIÓN DATA ═══
const ACTIVITIES = [
  { name: "Módulos", unit: "ud", totalUds: 4616, totalHH: 1306.5, hhPerUnit: 0.28, theoHHUd: 0.30, target: 6000,
    subtareas: [{ name: "Colocación", hh: 800 }, { name: "Conexionado", hh: 506.5 }],
    desp: 4, local: 6, field: 8, despHH: 290, localHH: 450, fieldHH: 566.5 },
  { name: "Trackers", unit: "ud", totalUds: 5991, totalHH: 5089.75, hhPerUnit: 0.85, theoHHUd: 0.90, target: 7500,
    subtareas: [{ name: "Montaje estructura", hh: 3200 }, { name: "Alineación", hh: 1889.75 }],
    desp: 6, local: 10, field: 12, despHH: 1100, localHH: 1800, fieldHH: 2189.75 },
  { name: "Hincas", unit: "Tk", totalUds: 1420, totalHH: 7553.7, hhPerUnit: 5.32, theoHHUd: 5.50, target: 1420,
    subtareas: [{ name: "Preparación terreno", hh: 2500 }, { name: "Hincado", hh: 3500 }, { name: "Revisión", hh: 1553.7 }],
    desp: 8, local: 12, field: 15, despHH: 1700, localHH: 2600, fieldHH: 3253.7 },
  { name: "Marcos", unit: "ud", totalUds: 1420, totalHH: 13914, hhPerUnit: 9.80, theoHHUd: 10.20, target: 1420,
    subtareas: [{ name: "Soldadura", hh: 6000 }, { name: "Montaje", hh: 5000 }, { name: "Calidad", hh: 2914 }],
    desp: 10, local: 18, field: 20, despHH: 2900, localHH: 5000, fieldHH: 6014 },
  { name: "Lima/Pintura", unit: "ud", totalUds: 1420, totalHH: 2994.5, hhPerUnit: 2.11, theoHHUd: 2.30, target: 1420,
    subtareas: [{ name: "Lijado", hh: 1200 }, { name: "Pintura", hh: 1794.5 }],
    desp: 3, local: 5, field: 7, despHH: 600, localHH: 1000, fieldHH: 1394.5 },
  { name: "Micropilotes", unit: "ud", totalUds: 1420, totalHH: 10212.4, hhPerUnit: 7.19, theoHHUd: 7.50, target: 1420,
    subtareas: [{ name: "Perforación", hh: 4500 }, { name: "Hormigonado", hh: 3500 }, { name: "Curado", hh: 2212.4 }],
    desp: 8, local: 14, field: 16, despHH: 2100, localHH: 3800, fieldHH: 4312.4 },
  { name: "Estructura", unit: "ud", totalUds: 1420, totalHH: 2325.5, hhPerUnit: 1.64, theoHHUd: 1.80, target: 1420,
    subtareas: [{ name: "Perfiles", hh: 1200 }, { name: "Soldadura", hh: 1125.5 }],
    desp: 3, local: 4, field: 6, despHH: 540, localHH: 800, fieldHH: 985.5 },
  { name: "Varios", unit: "ud", totalUds: 1420, totalHH: 1420, hhPerUnit: 1.00, theoHHUd: 1.10, target: 1420,
    subtareas: [{ name: "Trabajo general", hh: 1000 }, { name: "Limpieza", hh: 420 }],
    desp: 2, local: 3, field: 4, despHH: 320, localHH: 470, fieldHH: 630 },
];
const TOTAL_HH = 43096;
const TOTAL_TK = 1420;
const OVERALL_HH_TK = 30.35;

// ═══ RANKING DATA ═══
const CAPATAZ_RANKING = [
  { name: "Álvarez, R.", desv: -2.7, partes: 18, hhTotal: 2880 },
  { name: "Gómez, P.", desv: 6.0, partes: 15, hhTotal: 2700 },
  { name: "Martínez, L.", desv: 11.5, partes: 12, hhTotal: 1920 },
];
const OPERARIO_DELAY_RANKING = [
  { name: "Fernández, A.", subtarea: "Soldadura marcos", delayHH: 18.5, tipo: "DESP" as const },
  { name: "López, M.", subtarea: "Micropilotes", delayHH: 12.3, tipo: "LOCAL" as const },
  { name: "García, J.", subtarea: "Hincado", delayHH: 9.8, tipo: "FIELD" as const },
];
const ZONE_COMPARISON = [
  { zone: "Zona A", hhUd: 4.82, theoHHUd: 5.10, desv: -5.5 },
  { zone: "Zona B", hhUd: 5.45, theoHHUd: 5.10, desv: 6.9 },
  { zone: "Zona C", hhUd: 5.68, theoHHUd: 5.10, desv: 11.4 },
];

// ═══ TABLE HEADER STYLE ═══
const thStyle = { background: 'hsl(var(--navy))', color: 'hsl(var(--teal-pale))' };
const cellBorder = '1px solid hsl(var(--border))';

// ═══ SECTION RENDERERS ═══

const PartesSection = ({ period }: { period: Period }) => {
  const [expandedParte, setExpandedParte] = useState<number | null>(null);
  const div = PERIOD_DIVISORS[period];
  const totalPartes = Math.round(480 / div);
  const totalHH = Math.round(38400 / div);
  const desvProm = 3.2;
  const costeExtra = Math.round(12400 / div);
  const chartData = period === "todo" ? PARTES_CHART_DATA.map(d => ({ ...d, hh: d.hh * 24 }))
    : period === "mes" ? PARTES_CHART_DATA.map(d => ({ ...d, hh: Math.round(d.hh * 4.3) }))
    : period === "semana" ? PARTES_CHART_DATA
    : PARTES_CHART_DATA.map(d => ({ ...d, hh: Math.round(d.hh / 5) }));
  const visiblePartes = period === "hoy" ? PARTES_LIST.slice(0, 1) : period === "semana" ? PARTES_LIST.slice(0, 5) : PARTES_LIST;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <KPI label="Partes enviados" value={totalPartes} spark={[3, 5, 4, 6, 5, 7, 4]} />
        <KPI label="HH Totales" value={`${totalHH.toLocaleString("es-ES")}h`} spark={[120, 180, 150, 200, 170, 190, 160]} />
        <KPI label="Desv. promedio" value={`${desvProm}%`} spark={[2, 5, 3, 8, 4, 3, 6]} sparkColor="hsl(var(--warning))" />
        <KPI label="Coste extra" value={`${costeExtra.toLocaleString("es-ES")}€`} spark={[100, 200, 150, 300, 250, 180, 220]} sparkColor="hsl(var(--destructive))" />
      </div>
      <div className="sec-title">HH por día</div>
      <div className="glass-card p-3">
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={chartData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(168,55%,42%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#999" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
            <Bar dataKey="hh" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={`hsl(168, 55%, ${42 + i * 3}%)`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="sec-title">Partes enviados</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[70px_1fr_40px_50px_50px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>Fecha</span><span>Capataz</span><span className="text-center">Op.</span>
          <span className="text-right">HH</span><span className="text-right">Desv.</span>
        </div>
        {visiblePartes.map((p, i) => {
          const isExpanded = expandedParte === i;
          return (
            <div key={i}>
              <div
                className="grid grid-cols-[70px_1fr_40px_50px_50px] gap-1 px-3 py-2.5 items-center cursor-pointer transition-colors hover:bg-teal-bg"
                style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}
                onClick={() => setExpandedParte(isExpanded ? null : i)}
              >
                <span className="text-[10px] font-mono text-muted-foreground">
                  {new Date(p.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                </span>
                <span className="text-[11px] font-semibold truncate flex items-center gap-1">
                  <span style={{ transform: isExpanded ? 'rotate(90deg)' : '', display: 'inline-block', transition: 'transform .2s', fontSize: 10 }}>›</span>
                  {p.capataz}
                </span>
                <span className="text-[11px] font-mono text-center">{p.operarios}</span>
                <span className="text-[11px] font-mono font-bold text-right">{p.hh}h</span>
                <span className="text-right">
                  {p.desv === 0 ? <span className="pill pill-ok">0%</span>
                    : p.desv > 0 ? <span className="pill pill-warn">+{p.desv}%</span>
                    : <span className="pill pill-ok">{p.desv}%</span>}
                </span>
              </div>
              {isExpanded && p.subtareas && (
                <div style={{ background: 'hsl(var(--teal-bg))', borderBottom: cellBorder }}>
                  <div className="px-3 py-1.5">
                    <div className="text-[9px] font-bold uppercase text-muted-foreground mb-1.5">Desglose subtareas</div>
                    <div className="grid grid-cols-[1fr_50px_50px_50px_50px] gap-1 text-[8px] font-bold uppercase text-muted-foreground mb-1">
                      <span>Subtarea</span><span>Zona</span><span className="text-right">HH Real</span>
                      <span className="text-right">HH Teó.</span><span className="text-right">Desv.</span>
                    </div>
                    {p.subtareas.map((st, si) => {
                      const stDesv = ((st.hhReal - st.hhTeo) / st.hhTeo * 100);
                      const desvColor = stDesv <= 0 ? 'hsl(var(--teal))' : stDesv < 10 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
                      return (
                        <div key={si} className="grid grid-cols-[1fr_50px_50px_50px_50px] gap-1 py-1 items-center" style={{ borderTop: si > 0 ? '1px solid hsl(var(--border))' : 'none' }}>
                          <div>
                            <span className="text-[10px] font-medium">{st.name}</span>
                            <div className="text-[8px] text-muted-foreground">{st.responsible}</div>
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">{st.zone}</span>
                          <span className="text-[10px] font-mono font-bold text-right">{st.hhReal}h</span>
                          <span className="text-[10px] font-mono text-right text-muted-foreground">{st.hhTeo}h</span>
                          <span className="text-[10px] font-mono font-bold text-right" style={{ color: desvColor }}>
                            {stDesv >= 0 ? '+' : ''}{stDesv.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MaquinariaSection = ({ period }: { period: Period }) => {
  const div = PERIOD_DIVISORS[period];
  const totalMaq = MACHINES.length;
  const avgAvail = Math.round(MACHINES.reduce((s, m) => s + m.avail, 0) / MACHINES.length);
  const totalWorked = Math.round(MACHINES.reduce((s, m) => s + m.hhWorked, 0) / div);
  const totalLost = Math.round(MACHINES.reduce((s, m) => s + m.hhLost, 0) / div);
  const chartData = MACHINES.map(m => ({ name: m.name.split(" ")[0], avail: m.avail }));
  const visibleIncidents = period === "hoy" ? INCIDENTS.slice(0, 1) : period === "semana" ? INCIDENTS.slice(0, 3) : INCIDENTS;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <KPI label="Máquinas" value={totalMaq} spark={[6, 6, 6, 6, 6, 6, 6]} />
        <KPI label="Disponibilidad" value={`${avgAvail}%`} spark={[85, 90, 88, 92, 89, 91, 90]} />
        <KPI label="HH trabajadas" value={`${totalWorked.toLocaleString("es-ES")}h`} spark={[150, 180, 170, 190, 185, 175, 180]} />
        <KPI label="HH perdidas" value={`${totalLost.toLocaleString("es-ES")}h`} spark={[30, 20, 40, 15, 25, 35, 20]} sparkColor="hsl(var(--destructive))" />
      </div>
      <div className="sec-title">Disponibilidad por máquina</div>
      <div className="glass-card p-3">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: "#999" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "hsl(168,55%,42%)" }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="avail" radius={[0, 6, 6, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.avail >= 90 ? "hsl(168,55%,42%)" : d.avail >= 80 ? "hsl(38,78%,52%)" : "hsl(6,65%,46%)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-machine detail table */}
      <div className="sec-title">Detalle por máquina</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[1fr_45px_35px_50px_40px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>Máquina</span><span className="text-center">Días</span><span className="text-center">Inc.</span>
          <span className="text-right">HH</span><span className="text-right">Disp.</span>
        </div>
        {MACHINES.map((m, i) => (
          <div key={m.name} className="grid grid-cols-[1fr_45px_35px_50px_40px] gap-1 px-3 py-2 items-center"
            style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}>
            <span className="text-[10px] font-semibold truncate">{m.name}</span>
            <span className="text-[10px] font-mono text-center">{Math.round(m.daysActive / div)}</span>
            <span className="text-[10px] font-mono text-center font-bold" style={{ color: m.incidents > 4 ? 'hsl(var(--destructive))' : 'inherit' }}>{m.incidents}</span>
            <span className="text-[10px] font-mono text-right font-bold">{Math.round(m.hhWorked / div)}h</span>
            <span className="text-right">
              <span className="pill" style={{
                background: m.avail >= 90 ? 'hsl(var(--teal-pale))' : m.avail >= 80 ? 'hsl(var(--amber-bg))' : 'hsl(var(--red-bg))',
                color: m.avail >= 90 ? 'hsl(var(--badge-loc-text))' : m.avail >= 80 ? 'hsl(var(--amber-text))' : 'hsl(var(--destructive))',
              }}>{m.avail}%</span>
            </span>
          </div>
        ))}
      </div>

      <div className="sec-title">Incidencias</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[1fr_65px_45px_60px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>Máquina</span><span>Fecha</span><span className="text-center">Dur.</span><span className="text-right">Estado</span>
        </div>
        {visibleIncidents.map((inc, i) => (
          <div key={i} className="grid grid-cols-[1fr_65px_45px_60px] gap-1 px-3 py-2 items-center"
            style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}>
            <span className="text-[10px] font-semibold truncate">{inc.machine}</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {new Date(inc.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
            </span>
            <span className="text-[10px] font-mono text-center">{inc.duration}</span>
            <span className="text-right">
              {inc.status === "activa" ? <span className="pill pill-danger">ACTIVA</span> : <span className="pill pill-ok">RESUELTA</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FlotaSection = ({ period }: { period: Period }) => {
  const div = PERIOD_DIVISORS[period];
  const totalVeh = VEHICLES.length;
  const totalKm = Math.round(VEHICLES.reduce((s, v) => s + v.kmDay, 0) * (120 / div));
  const avgKm = Math.round(totalKm / totalVeh);
  const totalIncidents = VEHICLES.reduce((s, v) => s + v.incidents, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <KPI label="Vehículos" value={totalVeh} spark={[5, 5, 5, 5, 5, 5, 5]} />
        <KPI label="Km totales" value={`${totalKm.toLocaleString("es-ES")} km`} spark={[300, 350, 320, 380, 340, 360, 370]} />
        <KPI label="Km/veh. prom." value={`${avgKm.toLocaleString("es-ES")} km`} spark={[60, 72, 65, 78, 70, 74, 68]} />
        <KPI label="Incidencias" value={totalIncidents} spark={[0, 1, 0, 2, 1, 0, 1]} sparkColor="hsl(var(--warning))" />
      </div>
      <div className="sec-title">Registro de movimientos</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[80px_50px_30px_1fr_60px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>Matrícula</span><span className="text-center">Días</span><span className="text-center">Inc.</span>
          <span className="text-right">Km</span><span className="text-right">Km día</span>
        </div>
        {VEHICLES.map((v, i) => (
          <div key={v.plate} className="grid grid-cols-[80px_50px_30px_1fr_60px] gap-1 px-3 py-2.5 items-center"
            style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}>
            <span className="text-[11px] font-mono font-bold" style={{ color: 'hsl(var(--teal))' }}>{v.plate}</span>
            <span className="text-[10px] font-mono text-center">{Math.round(v.daysUsed / div)}</span>
            <span className="text-[10px] font-mono text-center font-bold" style={{ color: v.incidents > 2 ? 'hsl(var(--destructive))' : 'inherit' }}>{v.incidents}</span>
            <span className="text-[11px] font-mono text-right">{(v.kmEnd - v.kmStart).toLocaleString("es-ES")}</span>
            <div className="text-right">
              <span className="text-[11px] font-mono font-bold">{v.kmDay}</span>
              <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (v.kmDay / 100) * 100)}%`, background: 'hsl(var(--teal))' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── PRODUCCIÓN ── */
const ProduccionSection = ({ period }: { period: Period }) => {
  const div = PERIOD_DIVISORS[period];
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const data = useMemo(() => {
    return ACTIVITIES.map(a => ({
      ...a,
      periodUds: Math.round(a.totalUds / div),
      periodHH: +(a.totalHH / div).toFixed(1),
      pct: Math.min(100, Math.round((a.totalUds / a.target) * 100)),
      desv: ((a.hhPerUnit - a.theoHHUd) / a.theoHHUd * 100),
    }));
  }, [div]);

  const periodTotal = useMemo(() => ({
    hh: +(TOTAL_HH / div).toFixed(1),
    tk: Math.round(TOTAL_TK / div),
    hhTk: +OVERALL_HH_TK.toFixed(2),
  }), [div]);

  const totalTheoHH = ACTIVITIES.reduce((s, a) => s + a.theoHHUd * a.totalUds, 0);
  const totalDesvPct = ((TOTAL_HH - totalTheoHH) / totalTheoHH * 100);
  const totalDesp = ACTIVITIES.reduce((s, a) => s + a.desp, 0);
  const totalLocal = ACTIVITIES.reduce((s, a) => s + a.local, 0);
  const totalField = ACTIVITIES.reduce((s, a) => s + a.field, 0);
  const avgHHUd = TOTAL_HH / ACTIVITIES.reduce((s, a) => s + a.totalUds, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <KPI label="HH Total Proy." value={`${TOTAL_HH.toLocaleString("es-ES")}h`} spark={[6000, 7500, 8000, 7800, 8200, 7900, 8100]} />
        <KPI label="Desviación total" value={`${totalDesvPct.toFixed(1)}%`}
          spark={[2, -1, 3, -2, 1, -3, totalDesvPct]}
          sparkColor={totalDesvPct <= 0 ? "hsl(var(--teal))" : "hsl(var(--destructive))"} />
        <div className="stat-card flex flex-col gap-0.5">
          <div className="kmi-label">Operarios por tipo</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'hsl(var(--badge-desp-bg))', color: 'hsl(var(--badge-desp-text))' }}>D {totalDesp}</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'hsl(var(--badge-loc-bg))', color: 'hsl(var(--badge-loc-text))' }}>L {totalLocal}</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'hsl(var(--badge-fld-bg))', color: 'hsl(var(--badge-fld-text))' }}>F {totalField}</span>
          </div>
        </div>
        <KPI label="HH/Ud promedio" value={avgHHUd.toFixed(2)} spark={[3.2, 3.1, 3.0, 2.9, 3.1, 3.0, avgHHUd]} />
      </div>

      <div className="sec-title">Producción – {PERIOD_LABELS[period]}</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[1fr_50px_60px_45px_45px_35px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>Actividad</span><span className="text-right">Uds</span>
          <span className="text-right">HH</span><span className="text-right">HH/Ud</span>
          <span className="text-right">Desv.</span><span className="text-right">%</span>
        </div>
        {data.map((a, i) => {
          const isExpanded = expandedActivity === a.name;
          const desvColor = a.desv <= 0 ? 'hsl(var(--teal))' : a.desv < 10 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
          return (
            <div key={a.name}>
              <div
                className="grid grid-cols-[1fr_50px_60px_45px_45px_35px] gap-1 px-3 py-2 items-center cursor-pointer"
                style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}
                onClick={() => setExpandedActivity(isExpanded ? null : a.name)}
              >
                <div>
                  <div className="text-[11px] font-semibold flex items-center gap-1">
                    <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform .2s', fontSize: 10 }}>›</span>
                    {a.name}
                  </div>
                  <div className="text-[8px] font-mono text-muted-foreground">{a.unit}</div>
                </div>
                <span className="text-[11px] font-mono font-bold text-right">{a.periodUds.toLocaleString("es-ES")}</span>
                <span className="text-[11px] font-mono text-right">{a.periodHH.toLocaleString("es-ES")}</span>
                <span className="text-[11px] font-mono font-bold text-right" style={{ color: 'hsl(var(--teal))' }}>{a.hhPerUnit}</span>
                <span className="text-[10px] font-bold font-mono text-right" style={{ color: desvColor }}>
                  {a.desv >= 0 ? '+' : ''}{a.desv.toFixed(0)}%
                </span>
                <span className="text-[10px] font-bold text-right" style={{ color: a.pct >= 100 ? "hsl(var(--teal))" : "inherit" }}>
                  {a.pct}%
                </span>
              </div>
              <div className="px-3 pb-1">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${a.pct}%`, background: a.pct >= 100 ? "hsl(var(--teal))" : a.pct >= 75 ? "hsl(var(--teal))" : a.pct >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))" }} />
                </div>
              </div>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2" style={{ background: "hsl(var(--teal-bg))" }}>
                  <div>
                    <div className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Desglose por tipo operario</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="rounded-xl px-2 py-1.5 text-center" style={{ background: 'hsl(var(--badge-desp-bg))' }}>
                        <div className="text-[8px] font-bold" style={{ color: 'hsl(var(--badge-desp-text))' }}>DESP</div>
                        <div className="text-[11px] font-bold font-mono" style={{ color: 'hsl(var(--badge-desp-text))' }}>{a.desp} op.</div>
                        <div className="text-[9px] font-mono" style={{ color: 'hsl(var(--badge-desp-text))' }}>{(a.despHH / div).toFixed(0)}h</div>
                      </div>
                      <div className="rounded-xl px-2 py-1.5 text-center" style={{ background: 'hsl(var(--badge-loc-bg))' }}>
                        <div className="text-[8px] font-bold" style={{ color: 'hsl(var(--badge-loc-text))' }}>LOC</div>
                        <div className="text-[11px] font-bold font-mono" style={{ color: 'hsl(var(--badge-loc-text))' }}>{a.local} op.</div>
                        <div className="text-[9px] font-mono" style={{ color: 'hsl(var(--badge-loc-text))' }}>{(a.localHH / div).toFixed(0)}h</div>
                      </div>
                      <div className="rounded-xl px-2 py-1.5 text-center" style={{ background: 'hsl(var(--badge-fld-bg))' }}>
                        <div className="text-[8px] font-bold" style={{ color: 'hsl(var(--badge-fld-text))' }}>FLD</div>
                        <div className="text-[11px] font-bold font-mono" style={{ color: 'hsl(var(--badge-fld-text))' }}>{a.field} op.</div>
                        <div className="text-[9px] font-mono" style={{ color: 'hsl(var(--badge-fld-text))' }}>{(a.fieldHH / div).toFixed(0)}h</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Subtareas</div>
                    {a.subtareas.map((st, si) => (
                      <div key={si} className="flex justify-between py-1" style={{ borderBottom: si < a.subtareas.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
                        <span className="text-[10px]">{st.name}</span>
                        <span className="text-[10px] font-mono font-bold">{(st.hh / div).toFixed(0)}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div className="grid grid-cols-[1fr_50px_60px_45px_45px_35px] gap-1 px-3 py-2.5 items-center"
          style={{ background: "hsl(var(--navy))", color: '#fff', borderTop: "2px solid hsl(var(--teal))" }}>
          <span className="text-[11px] font-black uppercase">Total</span>
          <span className="text-[11px] font-mono font-black text-right">{periodTotal.tk.toLocaleString("es-ES")} Tk</span>
          <span className="text-[11px] font-mono font-bold text-right">{periodTotal.hh.toLocaleString("es-ES")}</span>
          <span className="text-[11px] font-mono font-black text-right">{periodTotal.hhTk}</span>
          <span className="text-[10px] font-bold font-mono text-right" style={{ color: totalDesvPct <= 0 ? 'hsl(var(--teal-light))' : '#fca5a5' }}>
            {totalDesvPct.toFixed(0)}%
          </span>
          <span />
        </div>
      </div>
    </div>
  );
};

/* ── RANKING ── */
const RankingSection = () => {
  return (
    <div className="space-y-4">
      {/* Capataces ranking */}
      <div className="sec-title">🏆 Top capataces por desviación</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[24px_1fr_55px_50px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>#</span><span>Capataz</span><span className="text-right">Partes</span><span className="text-right">Desv.</span>
        </div>
        {CAPATAZ_RANKING.map((c, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          const desvColor = c.desv <= 0 ? 'hsl(var(--teal))' : c.desv < 8 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
          return (
            <div key={c.name} className="grid grid-cols-[24px_1fr_55px_50px] gap-1 px-3 py-2.5 items-center"
              style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}>
              <span className="text-[14px]">{medals[i]}</span>
              <div>
                <span className="text-[11px] font-semibold">{c.name}</span>
                <div className="text-[9px] text-muted-foreground font-mono">{c.hhTotal.toLocaleString("es-ES")}h total</div>
              </div>
              <span className="text-[10px] font-mono text-right">{c.partes}</span>
              <span className="text-right">
                <span className="pill" style={{
                  background: c.desv <= 0 ? 'hsl(var(--teal-pale))' : c.desv < 8 ? 'hsl(var(--amber-bg))' : 'hsl(var(--red-bg))',
                  color: desvColor,
                }}>{c.desv >= 0 ? '+' : ''}{c.desv}%</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Operarios with most delay */}
      <div className="sec-title">⏱ Operarios con más retraso</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[24px_1fr_1fr_45px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>#</span><span>Operario</span><span>Subtarea</span><span className="text-right">HH+</span>
        </div>
        {OPERARIO_DELAY_RANKING.map((o, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          const BadgeComp = o.tipo === 'DESP' ? DespBadge : o.tipo === 'LOCAL' ? LocBadge : FldBadge;
          return (
            <div key={o.name} className="grid grid-cols-[24px_1fr_1fr_45px] gap-1 px-3 py-2.5 items-center"
              style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}>
              <span className="text-[14px]">{medals[i]}</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold truncate">{o.name}</span>
                <BadgeComp />
              </div>
              <span className="text-[10px] font-mono truncate text-muted-foreground">{o.subtarea}</span>
              <span className="text-[10px] font-mono font-bold text-right" style={{ color: 'hsl(var(--destructive))' }}>+{o.delayHH}h</span>
            </div>
          );
        })}
      </div>

      {/* Zone comparison */}
      <div className="sec-title">📍 Comparación por zona</div>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[1fr_55px_55px_50px] gap-1 px-3 py-2.5 text-[9px] font-bold uppercase" style={thStyle}>
          <span>Zona</span><span className="text-right">HH/Ud</span><span className="text-right">Teórico</span><span className="text-right">Desv.</span>
        </div>
        {ZONE_COMPARISON.map((z, i) => {
          const desvColor = z.desv <= 0 ? 'hsl(var(--teal))' : z.desv < 8 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
          return (
            <div key={z.zone}>
              <div className="grid grid-cols-[1fr_55px_55px_50px] gap-1 px-3 py-2.5 items-center"
                style={{ borderBottom: cellBorder, background: i % 2 === 0 ? 'transparent' : 'hsl(var(--teal-bg))' }}>
                <span className="text-[11px] font-semibold">{z.zone}</span>
                <span className="text-[11px] font-mono font-bold text-right">{z.hhUd}</span>
                <span className="text-[11px] font-mono text-right text-muted-foreground">{z.theoHHUd}</span>
                <span className="text-right">
                  <span className="pill" style={{
                    background: z.desv <= 0 ? 'hsl(var(--teal-pale))' : z.desv < 8 ? 'hsl(var(--amber-bg))' : 'hsl(var(--red-bg))',
                    color: desvColor,
                  }}>{z.desv >= 0 ? '+' : ''}{z.desv}%</span>
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="px-3 pb-1.5">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${Math.min(100, (z.hhUd / z.theoHHUd) * 80)}%`,
                    background: desvColor,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══ MAIN COMPONENT ═══
const SECTIONS: { key: Section; label: string }[] = [
  { key: "partes", label: "Partes" },
  { key: "maquinaria", label: "Maquinaria" },
  { key: "flota", label: "Flota" },
  { key: "produccion", label: "Producción" },
  { key: "ranking", label: "Ranking" },
];

const HistorialScreen = () => {
  const [section, setSection] = useState<Section>("partes");
  const [period, setPeriod] = useState<Period>("mes");

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all"
            style={{
              background: section === s.key ? "hsl(var(--navy))" : "hsl(var(--card))",
              color: section === s.key ? "hsl(var(--teal-light))" : "hsl(var(--muted-foreground))",
              border: section === s.key ? 'none' : '1px solid hsl(var(--border))',
              boxShadow: section === s.key ? '0 2px 6px rgba(15,31,58,0.2)' : 'none',
            }}>
            {s.label}
          </button>
        ))}
      </div>
      {section !== "ranking" && (
        <div className="flex gap-1.5">
          {(["hoy", "semana", "mes", "todo"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
              style={{
                background: period === p ? "hsl(var(--teal))" : "hsl(var(--card))",
                color: period === p ? "#fff" : "hsl(var(--teal))",
                border: period === p ? 'none' : '1px solid hsl(var(--border))',
                boxShadow: period === p ? '0 2px 6px rgba(47,183,164,0.3)' : 'none',
              }}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      )}
      {section === "partes" && <PartesSection period={period} />}
      {section === "maquinaria" && <MaquinariaSection period={period} />}
      {section === "flota" && <FlotaSection period={period} />}
      {section === "produccion" && <ProduccionSection period={period} />}
      {section === "ranking" && <RankingSection />}
    </div>
  );
};

export default HistorialScreen;
