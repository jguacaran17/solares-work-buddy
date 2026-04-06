import { useState, useMemo } from "react";

// Real Maracof PSFV San Pedro production data
const ACTIVITIES = [
  { name: "Módulos",        unit: "ud", totalUds: 4616,  totalHH: 1306.5,  hhPerUnit: 0.28,  target: 6000 },
  { name: "Trackers",       unit: "ud", totalUds: 5991,  totalHH: 5089.75, hhPerUnit: 0.85,  target: 7500 },
  { name: "Hincas",         unit: "Tk", totalUds: 1420,  totalHH: 7553.7,  hhPerUnit: 5.32,  target: 1420 },
  { name: "Marcos",         unit: "ud", totalUds: 1420,  totalHH: 13914,   hhPerUnit: 9.80,  target: 1420 },
  { name: "Lima/Pintura",   unit: "ud", totalUds: 1420,  totalHH: 2994.5,  hhPerUnit: 2.11,  target: 1420 },
  { name: "Micropilotes",   unit: "ud", totalUds: 1420,  totalHH: 10212.4, hhPerUnit: 7.19,  target: 1420 },
  { name: "Estructura",     unit: "ud", totalUds: 1420,  totalHH: 2325.5,  hhPerUnit: 1.64,  target: 1420 },
  { name: "Varios",         unit: "ud", totalUds: 1420,  totalHH: 1420,    hhPerUnit: 1.00,  target: 1420 },
];

const TOTAL_HH = 43096;
const TOTAL_TK = 1420;
const OVERALL_HH_TK = 30.35;

type Period = "hoy" | "semana" | "mes";

const PERIOD_DIVISORS: Record<Period, number> = {
  hoy: 120,   // ~120 working days elapsed
  semana: 24,  // ~24 weeks
  mes: 5.5,    // ~5.5 months
};

const HistorialScreen = () => {
  const [period, setPeriod] = useState<Period>("mes");

  const data = useMemo(() => {
    const div = PERIOD_DIVISORS[period];
    return ACTIVITIES.map(a => ({
      ...a,
      periodUds: Math.round(a.totalUds / div),
      periodHH: +(a.totalHH / div).toFixed(1),
      pct: Math.min(100, Math.round((a.totalUds / a.target) * 100)),
    }));
  }, [period]);

  const periodTotal = useMemo(() => {
    const div = PERIOD_DIVISORS[period];
    return {
      hh: +(TOTAL_HH / div).toFixed(1),
      tk: Math.round(TOTAL_TK / div),
      hhTk: +OVERALL_HH_TK.toFixed(2),
    };
  }, [period]);

  const periodLabels: Record<Period, string> = {
    hoy: "Hoy",
    semana: "Esta semana",
    mes: "Este mes",
  };

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="stat-card">
          <div className="kmi-label">HH Total Proy.</div>
          <div className="kmi-value">{TOTAL_HH.toLocaleString("es-ES")}h</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">Trackers</div>
          <div className="kmi-value">{TOTAL_TK.toLocaleString("es-ES")} Tk</div>
        </div>
        <div className="stat-card">
          <div className="kmi-label">HH/Tk global</div>
          <div className="kmi-value">{OVERALL_HH_TK}</div>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-1.5">
        {(["hoy", "semana", "mes"] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: period === p ? "hsl(var(--primary))" : "hsl(var(--g1))",
              color: period === p ? "hsl(var(--primary-foreground))" : "hsl(var(--g6))",
            }}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Section title */}
      <div className="sec-title">Producción – {periodLabels[period]}</div>

      {/* Data table */}
      <div className="glass-card rounded-[10px] overflow-hidden">
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_60px_70px_55px_40px] gap-1 px-3 py-2 text-[9px] font-bold uppercase"
          style={{ background: "hsl(var(--g05))", color: "hsl(var(--g5))", borderBottom: "1px solid hsl(var(--g1))" }}
        >
          <span>Actividad</span>
          <span className="text-right">Uds</span>
          <span className="text-right">HH</span>
          <span className="text-right">HH/Ud</span>
          <span className="text-right">%</span>
        </div>

        {/* Rows */}
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
            {/* Progress bar */}
            <div className="px-3 pb-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--g1))" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${a.pct}%`,
                    background: a.pct >= 100
                      ? "hsl(var(--success))"
                      : a.pct >= 75
                        ? "hsl(var(--primary))"
                        : a.pct >= 50
                          ? "hsl(var(--warning))"
                          : "hsl(var(--destructive))",
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Totals row */}
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

      {/* Cumulative totals card */}
      <div className="sec-title">Acumulado proyecto</div>
      <div className="glass-card rounded-[10px] overflow-hidden">
        <div
          className="grid grid-cols-[1fr_60px_70px_55px_40px] gap-1 px-3 py-2 text-[9px] font-bold uppercase"
          style={{ background: "hsl(var(--g05))", color: "hsl(var(--g5))", borderBottom: "1px solid hsl(var(--g1))" }}
        >
          <span>Actividad</span>
          <span className="text-right">Uds</span>
          <span className="text-right">HH</span>
          <span className="text-right">HH/Ud</span>
          <span className="text-right">%</span>
        </div>
        {ACTIVITIES.map((a, i) => (
          <div key={a.name}>
            <div
              className="grid grid-cols-[1fr_60px_70px_55px_40px] gap-1 px-3 py-2 items-center"
              style={{ borderBottom: i < ACTIVITIES.length - 1 ? "1px solid hsl(var(--g1))" : "none" }}
            >
              <span className="text-[11px] font-semibold" style={{ color: "hsl(var(--g8))" }}>{a.name}</span>
              <span className="text-[11px] font-mono font-bold text-right" style={{ color: "hsl(var(--g8))" }}>
                {a.totalUds.toLocaleString("es-ES")}
              </span>
              <span className="text-[11px] font-mono text-right" style={{ color: "hsl(var(--g7))" }}>
                {a.totalHH.toLocaleString("es-ES")}
              </span>
              <span className="text-[11px] font-mono font-bold text-right" style={{ color: "hsl(var(--primary))" }}>
                {a.hhPerUnit}
              </span>
              <span className="text-[10px] font-bold text-right" style={{
                color: Math.round((a.totalUds / a.target) * 100) >= 100 ? "hsl(var(--success))" : "hsl(var(--g7))"
              }}>
                {Math.min(100, Math.round((a.totalUds / a.target) * 100))}%
              </span>
            </div>
            <div className="px-3 pb-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--g1))" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((a.totalUds / a.target) * 100))}%`,
                    background: Math.round((a.totalUds / a.target) * 100) >= 100
                      ? "hsl(var(--success))"
                      : Math.round((a.totalUds / a.target) * 100) >= 75
                        ? "hsl(var(--primary))"
                        : "hsl(var(--warning))",
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
            {TOTAL_TK.toLocaleString("es-ES")} Tk
          </span>
          <span className="text-[11px] font-mono font-bold text-right" style={{ color: "hsl(var(--g7))" }}>
            {TOTAL_HH.toLocaleString("es-ES")}
          </span>
          <span className="text-[11px] font-mono font-black text-right" style={{ color: "hsl(var(--primary))" }}>
            {OVERALL_HH_TK}
          </span>
          <span />
        </div>
      </div>
    </div>
  );
};

export default HistorialScreen;
