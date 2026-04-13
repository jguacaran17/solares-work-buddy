import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Worker, Machine } from '@/lib/mock-data';

const BRAND = '#007C58';
const DATE_LABELS = ['01-08-25', '02-08-25', '03-08-25'];

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

const ESTUDIO_MAP: Record<string, number> = {
  'Hincado principal': 1.0,
  'HINCADO': 1.0,
  'Lima y pintura': 2.0,
  'Micropilotes': 3.0,
  'Micropilotes emplantillado': 3.0,
  'PERFORACIÓN': 5.0,
  'POT': 1.5,
  'Cableado': 2.5,
  'Estructura': 2.0,
  'Módulos': 1.8,
  'Trackers': 1.2,
};

// Historical baseline data from the client's Excel report
const HIST_PRODUCCION = [
  {
    activity: 'HINCADO',
    estudio: 1.0,
    historical: [
      { date: '01-08-25', prod: 10, hh: 25, rend: 2.5 },
      { date: '02-08-25', prod: 0, hh: 0, rend: 0 },
      { date: '03-08-25', prod: 0, hh: 0, rend: 0 },
    ],
  },
  {
    activity: 'PERFORACIÓN',
    estudio: 5.0,
    historical: [
      { date: '01-08-25', prod: 60, hh: 240, rend: 4.0 },
      { date: '02-08-25', prod: 0, hh: 0, rend: 0 },
      { date: '03-08-25', prod: 0, hh: 0, rend: 0 },
    ],
  },
];

const HIST_PERSONAL = [
  { name: 'Hincado principal', hh: [12, 0, 0] },
  { name: 'Lima y pintura', hh: [6, 0, 0] },
  { name: 'Micropilotes', hh: [18, 0, 0] },
  { name: 'POT', hh: [4, 0, 0] },
  { name: 'Cableado', hh: [8, 0, 0] },
  { name: 'Estructura', hh: [10, 0, 0] },
  { name: 'Módulos', hh: [5, 0, 0] },
  { name: 'Trackers', hh: [14, 0, 0] },
];

const HIST_MAQUINARIA = [
  { name: 'Hincadora Turchi', hh: [8, 0, 0], status: 'OK' },
  { name: 'Manitou 17M', hh: [6, 0, 0], status: 'OK' },
  { name: 'JCB 540-170', hh: [5, 0, 0], status: 'STOP' },
  { name: 'Bobcat TL 35.70', hh: [7, 0, 0], status: 'OK' },
  { name: 'Grúa Liebherr LTM', hh: [4, 0, 0], status: 'OK' },
  { name: 'Retroexcavadora CAT', hh: [6, 0, 0], status: 'OK' },
];

interface Props {
  workers: Worker[];
  assignments: Assignment[];
  hoursMap: Record<string, number>;
  productionMap: Record<string, TaskProduction>;
  machines: Machine[];
}

const sumArr = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const RendimientosScreen = ({ workers, assignments, hoursMap, productionMap, machines }: Props) => {
  const [subTab, setSubTab] = useState<'personal' | 'maquinaria' | 'produccion'>('personal');
  const [week, setWeek] = useState(16);

  const todayLabel = format(new Date(), 'dd-MM-yy');
  const allDates = [...DATE_LABELS, todayLabel];
  const colLabels = [...DATE_LABELS, 'Hoy'];

  const subTabs = [
    { id: 'personal' as const, label: 'Personal' },
    { id: 'maquinaria' as const, label: 'Maquinaria' },
    { id: 'produccion' as const, label: 'Producción' },
  ];

  // Personal: historical + today from parte
  const personalData = useMemo(() => {
    const map: Record<string, number[]> = {};
    HIST_PERSONAL.forEach(h => { map[h.name] = [...h.hh]; });
    // Add today's data from assignments
    assignments.forEach(a => {
      const todayHH = a.workerIds.reduce((sum, wId) => sum + (hoursMap[wId] || 0), 0);
      if (!map[a.activity]) map[a.activity] = new Array(DATE_LABELS.length).fill(0);
      map[a.activity].push(0); // placeholder, will be set below
      map[a.activity][DATE_LABELS.length] = todayHH;
    });
    // Ensure all rows have today column
    Object.keys(map).forEach(k => {
      if (map[k].length <= DATE_LABELS.length) map[k].push(0);
    });
    return Object.entries(map).map(([name, hh]) => ({ name, hh }));
  }, [assignments, hoursMap]);

  // Maquinaria: historical + today
  const maquinariaData = useMemo(() => {
    const rows = HIST_MAQUINARIA.map(h => {
      const machine = machines.find(m => m.name === h.name);
      const todayHH = machine ? machine.hoursToday || 0 : 0;
      const status = machine ? ((machine.hoursToday || 0) > 0 ? 'OK' : h.status) : h.status;
      return { name: h.name, hh: [...h.hh, todayHH], status };
    });
    // Add any machines from parte not in historical
    machines.filter(m => m.category === 'maquinaria' && !HIST_MAQUINARIA.find(h => h.name === m.name)).forEach(m => {
      rows.push({ name: m.name, hh: [0, 0, 0, m.hoursToday || 0], status: (m.hoursToday || 0) > 0 ? 'OK' : 'STOP' });
    });
    return rows;
  }, [machines]);

  // Producción: exact client data + today from parte
  const produccionData = useMemo(() => {
    // Map activity names from parte to production groups
    const parteToGroup: Record<string, string> = {
      'Hincado principal': 'HINCADO',
      'Micropilotes': 'PERFORACIÓN',
      'Micropilotes emplantillado': 'PERFORACIÓN',
    };

    return HIST_PRODUCCION.map(g => {
      const days = g.historical.map(d => ({
        date: d.date,
        prod: d.prod,
        hh: d.hh,
        rend: d.rend,
        estudio: g.estudio,
        isEmpty: d.prod === 0,
      }));

      // Add today's data from parte
      let todayProd = 0;
      let todayHH = 0;
      assignments.forEach(a => {
        const group = parteToGroup[a.activity] || a.activity.toUpperCase();
        if (group === g.activity) {
          const prod = productionMap[a.activity];
          todayProd += prod ? parseFloat(prod.udsProd) || 0 : 0;
          todayHH += a.workerIds.reduce((sum, wId) => sum + (hoursMap[wId] || 0), 0);
        }
      });

      const todayRend = todayProd > 0 ? +(todayHH / todayProd).toFixed(2) : 0;
      days.push({
        date: todayLabel,
        prod: todayProd,
        hh: todayHH,
        rend: todayRend,
        estudio: g.estudio,
        isEmpty: todayProd === 0 && todayHH === 0,
      });

      // Compute totals from non-empty days
      const filledDays = days.filter(d => !d.isEmpty);
      const totalProd = filledDays.reduce((s, d) => s + d.prod, 0);
      const totalHH = filledDays.reduce((s, d) => s + d.hh, 0);
      const avgRend = totalProd > 0 ? +(totalHH / totalProd).toFixed(2) : 0;

      return { activity: g.activity, days, estudio: g.estudio, totalProd, totalHH, avgRend };
    });
  }, [assignments, hoursMap, productionMap, todayLabel]);

  // --- Export ---
  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const dateRange = `${DATE_LABELS[0]} — ${todayLabel}`;

    // Sheet 1: Horas Personal
    const pHeader = ['ACTIVIDAD', ...colLabels, 'TOTAL'];
    const pRows = personalData.map(a => [a.name, ...a.hh, sumArr(a.hh)]);
    const pTotals = ['TOTAL', ...colLabels.map((_, i) => personalData.reduce((s, a) => s + (a.hh[i] || 0), 0)), personalData.reduce((s, a) => s + sumArr(a.hh), 0)];
    const ws1 = XLSX.utils.aoa_to_sheet([
      ['MARACOF — PSFV San Pedro', '', '', '', dateRange],
      [`Semana ${week}`], [], pHeader, ...pRows, pTotals,
    ]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Horas Personal');

    // Sheet 2: Horas Maquinaria
    const mHeader = ['MÁQUINA', ...colLabels, 'TOTAL', 'ESTADO'];
    const mRows = maquinariaData.map(m => [m.name, ...m.hh, sumArr(m.hh), m.status]);
    const ws2 = XLSX.utils.aoa_to_sheet([
      ['MARACOF — PSFV San Pedro', '', '', '', '', dateRange],
      [`Semana ${week}`], [], mHeader, ...mRows,
    ]);
    XLSX.utils.book_append_sheet(wb, ws2, 'Horas Maquinaria');

    // Sheet 3: Producción Rendimientos
    const prodSheetRows: (string | number)[][] = [
      ['MARACOF — PSFV San Pedro', '', '', '', dateRange],
      [`Semana ${week}`], [],
    ];
    produccionData.forEach(g => {
      prodSheetRows.push([g.activity, '', '', '', '', '']);
      prodSheetRows.push(['FECHA', 'PROD Ud', 'REND HH/Ud', 'ESTUDIO HH/Ud', 'DESVÍO HH/Ud', '']);
      const totalDesvio = +(g.avgRend - g.estudio).toFixed(2);
      prodSheetRows.push(['TOTAL', g.totalProd, g.avgRend, g.estudio, totalDesvio, '']);
      g.days.forEach(d => {
        if (d.isEmpty) {
          prodSheetRows.push([d.date, '', '', '', '', '']);
        } else {
          const desvio = +(d.rend - d.estudio).toFixed(2);
          prodSheetRows.push([d.date, d.prod, d.rend, d.estudio, desvio, '']);
        }
      });
      prodSheetRows.push(['', '', '', '', '', '']);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(prodSheetRows);
    XLSX.utils.book_append_sheet(wb, ws3, 'Producción Rendimientos');

    XLSX.writeFile(wb, `Rendimientos_S${week}_PSFV_SanPedro.xlsx`);
  }, [week, personalData, maquinariaData, produccionData, todayLabel, colLabels]);

  const exportCSV = useCallback(() => {
    let rows: string[][] = [];
    if (subTab === 'personal') {
      rows = [['ACTIVIDAD', ...colLabels, 'TOTAL'], ...personalData.map(a => [a.name, ...a.hh.map(String), String(sumArr(a.hh))])];
    } else if (subTab === 'maquinaria') {
      rows = [['MÁQUINA', ...colLabels, 'TOTAL', 'ESTADO'], ...maquinariaData.map(m => [m.name, ...m.hh.map(String), String(sumArr(m.hh)), m.status])];
    } else {
      rows = [['ACTIVIDAD', 'FECHA', 'PROD Ud', 'REND HH/Ud', 'ESTUDIO HH/Ud', 'DESVÍO HH/Ud']];
      produccionData.forEach(g => g.days.forEach(d => {
        const desvio = d.isEmpty ? '' : String(+(d.rend - d.estudio).toFixed(2));
        rows.push([g.activity, d.date, d.isEmpty ? '' : String(d.prod), d.isEmpty ? '' : String(d.rend), String(d.estudio), desvio]);
      }));
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rendimientos_${subTab}_S${week}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [subTab, week, personalData, maquinariaData, produccionData, colLabels]);

  const desvioStyle = (val: number) => {
    if (val > 0) return { background: '#FFCDD2', color: '#c62828' };
    if (val < 0) return { background: '#C8E6C9', color: '#2e7d32' };
    return { background: '#eee', color: '#666' };
  };

  return (
    <div className="space-y-3">
      {/* Week selector */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setWeek(w => w - 1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--teal-bg))' }}>
          <ChevronLeft size={18} style={{ color: BRAND }} />
        </button>
        <span className="text-[14px] font-bold" style={{ color: 'hsl(var(--navy))' }}>Semana {week}</span>
        <button onClick={() => setWeek(w => w + 1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--teal-bg))' }}>
          <ChevronRight size={18} style={{ color: BRAND }} />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BRAND}` }}>
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className="flex-1 py-2 text-[11px] font-bold transition-colors"
            style={{
              background: subTab === t.id ? BRAND : 'transparent',
              color: subTab === t.id ? '#fff' : BRAND,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tables */}
      <div className="overflow-x-auto rounded-2xl" style={{ boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
        {subTab === 'personal' && (
          <table className="w-full text-[11px] min-w-[500px]">
            <thead>
              <tr style={{ background: BRAND }}>
                <th className="text-left text-white font-bold py-2 px-2 whitespace-nowrap">ACTIVIDAD</th>
                {colLabels.map(d => <th key={d} className="text-center text-white font-bold py-2 px-1.5">{d}</th>)}
                <th className="text-center text-white font-bold py-2 px-2">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {personalData.map((a, i) => (
                <tr key={a.name} style={{ background: i % 2 === 0 ? '#fff' : '#E8F5E9' }}>
                  <td className="py-2 px-2 font-semibold whitespace-nowrap">{a.name}</td>
                  {a.hh.map((v, j) => <td key={j} className="text-center py-2 px-1.5 font-mono">{v || '—'}</td>)}
                  <td className="text-center py-2 px-2 font-bold font-mono">{sumArr(a.hh)}</td>
                </tr>
              ))}
              <tr style={{ background: BRAND }}>
                <td className="py-2 px-2 font-bold text-white">TOTAL</td>
                {colLabels.map((_, i) => (
                  <td key={i} className="text-center py-2 px-1.5 font-bold font-mono text-white">
                    {personalData.reduce((s, a) => s + (a.hh[i] || 0), 0) || '—'}
                  </td>
                ))}
                <td className="text-center py-2 px-2 font-bold font-mono text-white">
                  {personalData.reduce((s, a) => s + sumArr(a.hh), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {subTab === 'maquinaria' && (
          <table className="w-full text-[11px] min-w-[520px]">
            <thead>
              <tr style={{ background: BRAND }}>
                <th className="text-left text-white font-bold py-2 px-2 whitespace-nowrap">MÁQUINA</th>
                {colLabels.map(d => <th key={d} className="text-center text-white font-bold py-2 px-1.5">{d}</th>)}
                <th className="text-center text-white font-bold py-2 px-2">TOTAL</th>
                <th className="text-center text-white font-bold py-2 px-2">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {maquinariaData.map((m, i) => (
                <tr key={m.name} style={{ background: i % 2 === 0 ? '#fff' : '#E8F5E9' }}>
                  <td className="py-2 px-2 font-semibold whitespace-nowrap">{m.name}</td>
                  {m.hh.map((v, j) => <td key={j} className="text-center py-2 px-1.5 font-mono">{v || '—'}</td>)}
                  <td className="text-center py-2 px-2 font-bold font-mono">{sumArr(m.hh)}</td>
                  <td className="text-center py-2 px-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                      style={{ background: m.status === 'OK' ? '#16a34a' : '#e53e3e' }}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {subTab === 'produccion' && (
          <div className="space-y-3">
            {produccionData.map(g => {
              const totalDesvio = +(g.avgRend - g.estudio).toFixed(2);
              return (
                <div key={g.activity} className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
                  <div className="py-2 px-3 font-bold text-white text-[12px]" style={{ background: BRAND }}>{g.activity}</div>
                  <table className="w-full text-[11px] min-w-[440px]">
                    <thead>
                      <tr style={{ background: '#f0f0f0' }}>
                        <th className="text-left py-1.5 px-2 font-bold">Fecha</th>
                        <th className="text-center py-1.5 px-1.5 font-bold">PROD Ud</th>
                        <th className="text-center py-1.5 px-1.5 font-bold">REND HH/Ud</th>
                        <th className="text-center py-1.5 px-1.5 font-bold">ESTUDIO HH/Ud</th>
                        <th className="text-center py-1.5 px-2 font-bold">DESVÍO HH/Ud</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* TOTAL row */}
                      <tr style={{ background: '#E8F5E9', fontWeight: 700 }}>
                        <td className="py-2 px-2">TOTAL</td>
                        <td className="text-center py-2 px-1.5 font-mono">{g.totalProd}</td>
                        <td className="text-center py-2 px-1.5 font-mono">{g.avgRend}</td>
                        <td className="text-center py-2 px-1.5 font-mono">{g.estudio}</td>
                        <td className="text-center py-2 px-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold" style={desvioStyle(totalDesvio)}>
                            {totalDesvio > 0 ? '+' : ''}{totalDesvio}
                          </span>
                        </td>
                      </tr>
                      {/* Day rows */}
                      {g.days.map((d, i) => {
                        if (d.isEmpty) {
                          return (
                            <tr key={d.date} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                              <td className="py-1.5 px-2 font-mono">{d.date}</td>
                              <td className="text-center py-1.5 px-1.5 font-mono text-muted-foreground">—</td>
                              <td className="text-center py-1.5 px-1.5 font-mono text-muted-foreground">—</td>
                              <td className="text-center py-1.5 px-1.5 font-mono text-muted-foreground">—</td>
                              <td className="text-center py-1.5 px-2 font-mono text-muted-foreground">—</td>
                            </tr>
                          );
                        }
                        const desvio = +(d.rend - d.estudio).toFixed(2);
                        return (
                          <tr key={d.date} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                            <td className="py-1.5 px-2 font-mono">{d.date === todayLabel ? `${d.date} ★` : d.date}</td>
                            <td className="text-center py-1.5 px-1.5 font-mono">{d.prod}</td>
                            <td className="text-center py-1.5 px-1.5 font-mono">{d.rend}</td>
                            <td className="text-center py-1.5 px-1.5 font-mono">{d.estudio}</td>
                            <td className="text-center py-1.5 px-2">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold" style={desvioStyle(desvio)}>
                                {desvio > 0 ? '+' : ''}{desvio}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        <button onClick={exportExcel} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white" style={{ background: BRAND }}>
          <FileSpreadsheet size={16} /> Descargar Excel
        </button>
        <button onClick={exportCSV} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold border-2" style={{ borderColor: BRAND, color: BRAND, background: 'transparent' }}>
          <Download size={16} /> Descargar CSV
        </button>
      </div>
    </div>
  );
};

export default RendimientosScreen;
