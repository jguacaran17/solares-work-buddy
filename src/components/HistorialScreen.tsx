import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────
type Period = "hoy" | "semana" | "mes" | "todo";
type Section = "partes" | "maquinaria" | "flota" | "produccion";

const PERIOD_LABELS: Record<Period, string> = { hoy: "Hoy", semana: "Semana", mes: "Mes", todo: "Todo" };
const PERIOD_DIVISORS: Record<Period, number> = { hoy: 120, semana: 24, mes: 5.5, todo: 1 };

// ─── Sparkline helper ────────────────────────────────────────────────
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

// ─── KPI Card ────────────────────────────────────────────────────────
const KPI = ({ label, value, spark, sparkColor = "hsl(var(--primary))" }: {
  label: string; value: string | number; spark?: number[]; sparkColor?: string;
}) => (
  <div className="stat-card flex flex-col gap-0.5">
    <div className="kmi-label">{label}</div>
    <div className="flex items-end gap-1">
      <span className="kmi-value text-[16px]">{value}</span>
      {spark && <Spark values={spark} color={sparkColor} />}
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════
//  PARTES DATA
// ═════════════════════════════════════════════════════════════════════
const PARTES_LIST = [
  { date: "2026-04-04", capataz: "Álvarez, R.", operarios: 18, hh: 144, desv: 0 },
  { date: "2026-04-03", capataz: "Gómez, P.", operarios: 22, hh: 198, desv: 12 },
  { date: "2026-04-02", capataz: "Álvarez, R.", operarios: 20, hh: 180, desv: -5 },
  { date: "2026-04-01", capataz: "Martínez, L.", operarios: 16, hh: 128, desv: 8 },
  { date: "2026-03-31", capataz: "Gómez, P.", operarios: 24, hh: 216, desv: 0 },
  { date: "2026-03-28", capataz: "Álvarez, R.", operarios: 19, hh: 171, desv: -3 },
  { date: "2026-03-27", capataz: "Martínez, L.", operarios: 21, hh: 189, desv: 15 },
  { date: "2026-03-26", capataz: "Gómez, P.", operarios: 17, hh: 153, desv: 6 },
];

const PARTES_CHART_DATA = [
  { day: "Lun", hh: 144 }, { day: "Mar", hh: 198 }, { day: "Mié", hh: 180 },
  { day: "Jue", hh: 128 }, { day: "Vie", hh: 216 }, { day: "Sáb", hh: 72 }, { day: "Dom", hh: 0 },
];

// ═════════════════════════════════════════════════════════════════════
//  MAQUINARIA DATA
// ═════════════════════════════════════════════════════════════════════
const MACHINES = [
  { name: "Hincadora CAT-350", avail: 92, hhWorked: 1840, hhLost: 160 },
  { name: "Grúa Liebherr LTM", avail: 88, hhWorked: 1760, hhLost: 240 },
  { name: "Retroexcav. JCB", avail: 95, hhWorked: 1900, hhLost: 100 },
  { name: "Perforadora Bauer", avail: 78, hhWorked: 1560, hhLost: 440 },
  { name: "Manipuladora Merlo", avail: 97, hhWorked: 1940, hhLost: 60 },
  { name: "Camión grúa Hiab", avail: 85, hhWorked: 1700, hhLost: 300 },
];

const INCIDENTS = [
  { machine: "Perforadora Bauer", date: "2026-04-03", duration: "6h", status: "activa" as const },
  { machine: "Grúa Liebherr LTM", date: "2026-04-01", duration: "4h", status: "resuelta" as const },
  { machine: "Camión grúa Hiab", date: "2026-03-28", duration: "8h", status: "resuelta" as const },
  { machine: "Hincadora CAT-350", date: "2026-03-25", duration: "3h", status: "resuelta" as const },
  { machine: "Perforadora Bauer", date: "2026-03-20", duration: "12h", status: "resuelta" as const },
];

// ═════════════════════════════════════════════════════════════════════
//  FLOTA DATA
// ═════════════════════════════════════════════════════════════════════
const VEHICLES = [
  { plate: "3821-PLK", kmStart: 45230, kmEnd: 45312, kmDay: 82 },
  { plate: "8432-BKM", kmStart: 32100, kmEnd: 32178, kmDay: 78 },
  { plate: "1245-GHT", kmStart: 67890, kmEnd: 67945, kmDay: 55 },
  { plate: "9087-XCV", kmStart: 21340, kmEnd: 21412, kmDay: 72 },
  { plate: "5643-MNP", kmStart: 89100, kmEnd: 89188, kmDay: 88 },
];

// ═════════════════════════════════════════════════════════════════════
//  PRODUCCIÓN DATA (original)
// ═════════════════════════════════════════════════════════════════════
const ACTIVITIES = [
  { name: "Módulos", unit: "ud", totalUds: 4616, totalHH: 1306.5, hhPerUnit: 0.28, target: 6000 },
  { name: "Trackers", unit: "ud", totalUds: 5991, totalHH: 5089.75, hhPerUnit: 0.85, target: 7500 },
  { name: "Hincas", unit: "Tk", totalUds: 1420, totalHH: 7553.7, hhPerUnit: 5.32, target: 1420 },
  { name: "Marcos", unit: "ud", totalUds: 1420, totalHH: 13914, hhPerUnit: 9.80, target: 1420 },
  { name: "Lima/Pintura", unit: "ud", totalUds: 1420, totalHH: 2994.5, hhPerUnit: 2.11, target: 1420 },
  { name: "Micropilotes", unit: "ud", totalUds: 1420, totalHH: 10212.4, hhPerUnit: 7.19, target: 1420 },
  { name: "Estructura", unit: "ud", totalUds: 1420, totalHH: 2325.5, hhPerUnit: 1.64, target: 1420 },
  { name: "Varios", unit: "ud", totalUds: 1420, totalHH: 1420, hhPerUnit: 1.00, target: 1420 },
];
const TOTAL_HH = 43096;
const TOTAL_TK = 1420;
const OVERALL_HH_TK = 30.35;

// ═════════════════════════════════════════════════════════════════════
//  SECTION RENDERERS
// ═════════════════════════════════════════════════════════════════════

/* ── PARTES ─────────────────────────────────────────────────── */
const PartesSection = ({ period }: { period: Period }) => {
  const div = PERIOD_DIVISORS[period];
  const totalPartes = Math.round(480 / div);
  const totalHH = Math.round(38400 / div);
  const desvProm = 3.2;
  const costeExtra = Math.round(12400 / div);

  const chartData = period === "todo"
    ? PARTES_CHART_DATA.map(d => ({ ...d, hh: d.hh * 24 }))
    : period === "mes"
      ? PARTES_CHART_DATA.map(d => ({ ...d, hh: Math.round(d.hh * 4.3) }))
      : period === "semana"
        ? PARTES_CHART_DATA
        : PARTES_CHART_DATA.map(d => ({ ...d, hh: Math.round(d.hh / 5) }));

  const visiblePartes = period === "hoy" ? PARTES_LIST.slice(0, 1)
    : period === "semana" ? PARTES_LIST.slice(0, 5)
      : period === "mes" ? PARTES_LIST
        : PARTES_LIST;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <KPI label="Partes enviados" value={totalPartes} spark={[3, 5, 4, 6, 5, 7, 4]} />
        <KPI label="HH Totales" value={`${totalHH.toLocaleString("es-ES")}h`} spark={[120, 180, 150, 200, 170, 190, 160]} />
        <KPI label="Desv. promedio" value={`${desvProm}%`} spark={[2, 5, 3, 8, 4, 3, 6]} sparkColor="hsl(var(--warning))" />
        <KPI label="Coste extra" value={`${costeExtra.toLocaleString("es-ES")}€`} spark={[100, 200, 150, 300, 250, 180, 220]} sparkColor="hsl(var(--destructive))" />
      </div>

      <div className="sec-title">HH por día</div>
      <div className="glass-card rounded-[10px] p-3">
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={chartData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--g1))" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(168,55%,42%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#999" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="hh" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={`hsl(168, 55%, ${42 + i * 3}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="sec-title">Partes enviados</div>
      <div className="glass-card rounded-[10px] overflow-hidden">
        <div
          className="grid grid-cols-[70px_1fr_40px_50px_50px] gap-1 px-3 py-2 text-[9px] font-bold uppercase"
          style={{ background: "hsl(var(--g05))", color: "hsl(var(--g5))", borderBottom: "1px solid hsl(var(--g1))" }}
        >
          <span>Fecha</span><span>Capataz</span><span className="text-center">Op.</span>
          <span className="text-right">HH</span><span className="text-right">Desv.</span>
        </div>
        {visiblePartes.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-[70px_1fr_40px_50px_50px] gap-1 px-3 py-2 items-center"
            style={{ borderBottom: i < visiblePartes.length - 1 ? "1px solid hsl(var(--g1))" : "none" }}
          >
            <span className="text-[10px] font-mono" style={{ color: "hsl(var(--g5))" }}>
              {new Date(p.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
            </span>
            <span className="text-[11px] font-semibold truncate" style={{ color: "hsl(var(--g8))" }}>{p.capataz}</span>
            <span className="text-[11px] font-mono text-center" style={{ color: "hsl(var(--g7))" }}>{p.operarios}</span>
            <span className="text-[11px] font-mono font-bold text-right" style={{ color: "hsl(var(--g8))" }}>{p.hh}h</span>
            <span className="text-right">
              {p.desv === 0
                ? <span className="pill pill-ok">0%</span>
                : p.desv > 0
                  ? <span className="pill pill-warn">+{p.desv}%</span>
                  : <span className="pill pill-ok">{p.desv}%</span>
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── MAQUINARIA ─────────────────────────────────────────────── */
const MaquinariaSection = ({ period }: { period: Period }) => {
  const div = PERIOD_DIVISORS[period];
  const totalMaq = MACHINES.length;
  const avgAvail = Math.round(MACHINES.reduce((s, m) => s + m.avail, 0) / MACHINES.length);
  const totalWorked = Math.round(MACHINES.reduce((s, m) => s + m.hhWorked, 0) / div);
  const totalLost = Math.round(MACHINES.reduce((s, m) => s + m.hhLost, 0) / div);

  const chartData = MACHINES.map(m => ({ name: m.name.split(" ")[0], avail: m.avail }));

  const visibleIncidents = period === "hoy" ? INCIDENTS.slice(0, 1)
    : period === "semana" ? INCIDENTS.slice(0, 3)
      : INCIDENTS;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <KPI label="Máquinas" value={totalMaq} spark={[6, 6, 6, 6, 6, 6, 6]} />
        <KPI label="Disponibilidad" value={`${avgAvail}%`} spark={[85, 90, 88, 92, 89, 91, 90]} />
        <KPI label="HH trabajadas" value={`${totalWorked.toLocaleString("es-ES")}h`} spark={[150, 180, 170, 190, 185, 175, 180]} />
        <KPI label="HH perdidas" value={`${totalLost.toLocaleString("es-ES")}h`} spark={[30, 20, 40, 15, 25, 35, 20]} sparkColor="hsl(var(--destructive))" />
      </div>

      <div className="sec-title">Disponibilidad por máquina</div>
      <div className="glass-card rounded-[10px] p-3">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--g1))" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: "#999" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "hsl(168,55%,42%)" }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="avail" radius={[0, 4, 4, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.avail >= 90 ? "hsl(152,60%,42%)" : d.avail >= 80 ? "hsl(38,78%,52%)" : "hsl(6,65%,46%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="sec-title">Incidencias</div>
      <div className="glass-card rounded-[10px] overflow-hidden">
        <div
          className="grid grid-cols-[1fr_65px_45px_60px] gap-1 px-3 py-2 text-[9px] font-bold uppercase"
          style={{ background: "hsl(var(--g05))", color: "hsl(var(--g5))", borderBottom: "1px solid hsl(var(--g1))" }}
        >
          <span>Máquina</span><span>Fecha</span><span className="text-center">Dur.</span><span className="text-right">Estado</span>
        </div>
        {visibleIncidents.map((inc, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_65px_45px_60px] gap-1 px-3 py-2 items-center"
            style={{ borderBottom: i < visibleIncidents.length - 1 ? "1px solid hsl(var(--g1))" : "none" }}
          >
            <span className="text-[10px] font-semibold truncate" style={{ color: "hsl(var(--g8))" }}>{inc.machine}</span>
            <span className="text-[10px] font-mono" style={{ color: "hsl(var(--g5))" }}>
              {new Date(inc.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
            </span>
            <span className="text-[10px] font-mono text-center" style={{ color: "hsl(var(--g7))" }}>{inc.duration}</span>
            <span className="text-right">
              {inc.status === "activa"
                ? <span className="pill pill-danger">ACTIVA</span>
                : <span className="pill pill-ok">RESUELTA</span>
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── FLOTA ──────────────────────────────────────────────────── */
const FlotaSection = ({ period }: { period: Period }) => {
  const div = PERIOD_DIVISORS[period];
  const totalVeh = VEHICLES.length;
  const totalKm = Math.round(VEHICLES.reduce((s, v) => s + v.kmDay, 0) * (120 / div));
  const avgKm = Math.round(totalKm / totalVeh);
  const incidencias = period === "hoy" ? 0 : period === "semana" ? 2 : period === "mes" ? 5 : 14;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <KPI label="Vehículos" value={totalVeh} spark={[5, 5, 5, 5, 5, 5, 5]} />
        <KPI label="Km totales" value={`${totalKm.toLocaleString("es-ES")} km`} spark={[300, 350, 320, 380, 340, 360, 370]} />
        <KPI label="Km/veh. prom." value={`${avgKm.toLocaleString("es-ES")} km`} spark={[60, 72, 65, 78, 70, 74, 68]} />
        <KPI label="Incidencias" value={incidencias} spark={[0, 1, 0, 2, 1, 0, 1]} sparkColor="hsl(var(--warning))" />
      </div>

      <div className="sec-title">Registro de movimientos</div>
      <div className="glass-card rounded-[10px] overflow-hidden">
        <div
          className="grid grid-cols-[80px_1fr_1fr_60px] gap-1 px-3 py-2 text-[9px] font-bold uppercase"
          style={{ background: "hsl(var(--g05))", color: "hsl(var(--g5))", borderBottom: "1px solid hsl(var(--g1))" }}
        >
          <span>Matrícula</span><span className="text-right">Km salida</span>
          <span className="text-right">Km llegada</span><span className="text-right">Km día</span>
        </div>
        {VEHICLES.map((v, i) => (
          <div
            key={v.plate}
            className="grid grid-cols-[80px_1fr_1fr_60px] gap-1 px-3 py-2 items-center"
            style={{ borderBottom: i < VEHICLES.length - 1 ? "1px solid hsl(var(--g1))" : "none" }}
          >
            <span className="text-[11px] font-mono font-bold" style={{ color: "hsl(var(--primary))" }}>{v.plate}</span>
            <span className="text-[11px] font-mono text-right" style={{ color: "hsl(var(--g7))" }}>
              {v.kmStart.toLocaleString("es-ES")}
            </span>
            <span className="text-[11px] font-mono text-right" style={{ color: "hsl(var(--g7))" }}>
              {v.kmEnd.toLocaleString("es-ES")}
            </span>
            <div className="text-right">
              <span className="text-[11px] font-mono font-bold" style={{ color: "hsl(var(--g8))" }}>{v.kmDay}</span>
              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--g1))" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (v.kmDay / 100) * 100)}%`,
                    background: v.kmDay > 80 ? "hsl(var(--primary))" : "hsl(var(--g4))",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── PRODUCCIÓN (preserved) ─────────────────────────────────── */
const ProduccionSection = ({ period }: { period: Period }) => {
  const div = PERIOD_DIVISORS[period];

  const data = useMemo(() => {
    return ACTIVITIES.map(a => ({
      ...a,
      periodUds: Math.round(a.totalUds / div),
      periodHH: +(a.totalHH / div).toFixed(1),
      pct: Math.min(100, Math.round((a.totalUds / a.target) * 100)),
    }));
  }, [div]);

  const periodTotal = useMemo(() => ({
    hh: +(TOTAL_HH / div).toFixed(1),
    tk: Math.round(TOTAL_TK / div),
    hhTk: +OVERALL_HH_TK.toFixed(2),
  }), [div]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <KPI label="HH Total Proy." value={`${TOTAL_HH.toLocaleString("es-ES")}h`} spark={[6000, 7500, 8000, 7800, 8200, 7900, 8100]} />
        <KPI label="Trackers" value={`${TOTAL_TK.toLocaleString("es-ES")} Tk`} spark={[200, 220, 240, 250, 260, 270, 280]} />
        <KPI label="HH/Tk" value={OVERALL_HH_TK} spark={[32, 31, 30.5, 30.8, 30.4, 30.2, 30.35]} />
      </div>

      <div className="sec-title">Producción – {PERIOD_LABELS[period]}</div>
      <div className="glass-card rounded-[10px] overflow-hidden">
        <div
          className="grid grid-cols-[1fr_60px_70px_55px_40px] gap-1 px-3 py-2 text-[9px] font-bold uppercase"
          style={{ background: "hsl(var(--g05))", color: "hsl(var(--g5))", borderBottom: "1px solid hsl(var(--g1))" }}
        >
          <span>Actividad</span><span className="text-right">Uds</span>
          <span className="text-right">HH</span><span className="text-right">HH/Ud</span><span className="text-right">%</span>
        </div>
        {data.map((a, i) => (
          <div key={a.name}>
            <div
              className="grid grid-cols-[1fr_60px_70px_55px_40px] gap-1 px-3 py-2 items-center"
              style={{ borderBottom: i < data.length - 1 ? "1px solid hsl(var(--g1))" : "none" }}
            >
              <div>
                <div className="text-[11px] font-semibold" style={{ color: "hsl(var(--g8))" }}>{a.name}</div>
                <div className="text-[8px] font-mono" style={{ color: "hsl(var(--g5))" }}>{a.unit}</div>
              </div>
              <span className="text-[11px] font-mono font-bold text-right" style={{ color: "hsl(var(--g8))" }}>
                {a.periodUds.toLocaleString("es-ES")}
              </span>
              <span className="text-[11px] font-mono text-right" style={{ color: "hsl(var(--g7))" }}>
                {a.periodHH.toLocaleString("es-ES")}
              </span>
              <span className="text-[11px] font-mono font-bold text-right" style={{ color: "hsl(var(--primary))" }}>
                {a.hhPerUnit}
              </span>
              <span className="text-[10px] font-bold text-right" style={{ color: a.pct >= 100 ? "hsl(var(--success))" : "hsl(var(--g7))" }}>
                {a.pct}%
              </span>
            </div>
            <div className="px-3 pb-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--g1))" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${a.pct}%`,
                    background: a.pct >= 100 ? "hsl(var(--success))" : a.pct >= 75 ? "hsl(var(--primary))" : a.pct >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <div
          className="grid grid-cols-[1fr_60px_70px_55px_40px] gap-1 px-3 py-2.5 items-center"
          style={{ background: "hsl(var(--g05))", borderTop: "2px solid hsl(var(--g2))" }}
        >
          <span className="text-[11px] font-black uppercase" style={{ color: "hsl(var(--g8))" }}>Total</span>
          <span className="text-[11px] font-mono font-black text-right" style={{ color: "hsl(var(--g8))" }}>
            {periodTotal.tk.toLocaleString("es-ES")} Tk
          </span>
          <span className="text-[11px] font-mono font-bold text-right" style={{ color: "hsl(var(--g7))" }}>
            {periodTotal.hh.toLocaleString("es-ES")}
          </span>
          <span className="text-[11px] font-mono font-black text-right" style={{ color: "hsl(var(--primary))" }}>
            {periodTotal.hhTk}
          </span>
          <span />
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
const SECTIONS: { key: Section; label: string }[] = [
  { key: "partes", label: "Partes" },
  { key: "maquinaria", label: "Maquinaria" },
  { key: "flota", label: "Flota" },
  { key: "produccion", label: "Producción" },
];

const HistorialScreen = () => {
  const [section, setSection] = useState<Section>("partes");
  const [period, setPeriod] = useState<Period>("mes");

  return (
    <div className="space-y-3">
      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all"
            style={{
              background: section === s.key ? "hsl(var(--secondary))" : "hsl(var(--g05))",
              color: section === s.key ? "hsl(var(--secondary-foreground))" : "hsl(var(--g7))",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Period filter */}
      <div className="flex gap-1.5">
        {(["hoy", "semana", "mes", "todo"] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: period === p ? "hsl(var(--primary))" : "hsl(var(--g1))",
              color: period === p ? "hsl(var(--primary-foreground))" : "hsl(var(--g6))",
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Section content */}
      {section === "partes" && <PartesSection period={period} />}
      {section === "maquinaria" && <MaquinariaSection period={period} />}
      {section === "flota" && <FlotaSection period={period} />}
      {section === "produccion" && <ProduccionSection period={period} />}
    </div>
  );
};

export default HistorialScreen;
