import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Worker, Machine } from '@/lib/mock-data';

const BRAND = '#007C58';
const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

// Configurable budgeted HH/Ud per activity
const ESTUDIO_MAP: Record<string, number> = {
  'Hincado principal': 1.0,
  'Lima y pintura': 2.0,
  'Micropilotes': 3.0,
  'Micropilotes emplantillado': 3.0,
  'POT': 1.5,
  'Cableado': 2.5,
  'Estructura': 2.0,
  'Módulos': 1.8,
  'Trackers': 1.2,
};

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
  const [week, setWeek] = useState(32);

  const subTabs = [
    { id: 'personal' as const, label: 'Personal' },
    { id: 'maquinaria' as const, label: 'Maquinaria' },
    { id: 'produccion' as const, label: 'Producción' },
  ];

  // Build personal data from assignments + hoursMap
  // Today's data goes into the first day slot (index 0); rest are 0
  const personalData = useMemo(() => {
    const activityMap: Record<string, number[]> = {};
    assignments.forEach(a => {
      const hh = new Array(6).fill(0);
      // Sum HH of assigned workers for today
      const totalHH = a.workerIds.reduce((sum, wId) => sum + (hoursMap[wId] || 0), 0);
      hh[0] = totalHH; // today = first column
      activityMap[a.activity] = hh;
    });
    return Object.entries(activityMap).map(([name, hh]) => ({ name, hh }));
  }, [assignments, hoursMap]);

  // Build maquinaria data from machines state
  const maquinariaData = useMemo(() => {
    return machines
      .filter(m => m.category === 'maquinaria')
      .map(m => {
        const hh = new Array(6).fill(0);
        hh[0] = m.hoursToday || 0;
        const status = (m.hoursToday || 0) > 0 ? 'OK' : 'STOP';
        return { name: m.name, hh, status };
      });
  }, [machines]);

  // Build production data from productionMap + assignments
  const produccionData = useMemo(() => {
    const groups: Record<string, { days: { date: string; prod: number; hh: number; estudio: number }[] }> = {};

    assignments.forEach(a => {
      const prod = productionMap[a.activity];
      const units = prod ? parseFloat(prod.udsProd) || 0 : 0;
      const totalHH = a.workerIds.reduce((sum, wId) => sum + (hoursMap[wId] || 0), 0);
      const estudio = ESTUDIO_MAP[a.activity] || 2.0;

      if (!groups[a.activity]) {
        groups[a.activity] = { days: [] };
      }
      groups[a.activity].days.push({
        date: DAY_LABELS[0],
        prod: units,
        hh: totalHH,
        estudio,
      });
    });

    return Object.entries(groups).map(([activity, data]) => ({
      activity: activity.toUpperCase(),
      days: data.days.length > 0 ? data.days : [{ date: DAY_LABELS[0], prod: 0, hh: 0, estudio: ESTUDIO_MAP[activity] || 2.0 }],
    }));
  }, [assignments, hoursMap, productionMap]);

  // --- Export ---
  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Horas Personal
    const pHeader = ['ACTIVIDAD', ...DAY_LABELS, 'TOTAL'];
    const pRows = personalData.map(a => [a.name, ...a.hh, sumArr(a.hh)]);
    const pTotals = ['TOTAL', ...DAY_LABELS.map((_, i) => personalData.reduce((s, a) => s + a.hh[i], 0)), personalData.reduce((s, a) => s + sumArr(a.hh), 0)];
    const ws1 = XLSX.utils.aoa_to_sheet([['MARACOF — PSFV San Pedro', '', '', '', '', '', '', `Semana ${week}`], [], pHeader, ...pRows, pTotals]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Horas Personal');

    // Sheet 2: Horas Maquinaria
    const mHeader = ['MÁQUINA', ...DAY_LABELS, 'TOTAL', 'ESTADO'];
    const mRows = maquinariaData.map(m => [m.name, ...m.hh, sumArr(m.hh), m.status]);
    const ws2 = XLSX.utils.aoa_to_sheet([['MARACOF — PSFV San Pedro', '', '', '', '', '', '', '', `Semana ${week}`], [], mHeader, ...mRows]);
    XLSX.utils.book_append_sheet(wb, ws2, 'Horas Maquinaria');

    // Sheet 3: Producción Rendimientos
    const prodSheetRows: (string | number)[][] = [['MARACOF — PSFV San Pedro', '', '', '', '', `Semana ${week}`], []];
    produccionData.forEach(g => {
      const totalProd = g.days.reduce((s, d) => s + d.prod, 0);
      const totalHH = g.days.reduce((s, d) => s + d.hh, 0);
      const avgRend = totalProd > 0 ? +(totalHH / totalProd).toFixed(2) : 0;
      const avgEstudio = g.days[0]?.estudio || 0;
      prodSheetRows.push([g.activity, '', '', '', '', '']);
      prodSheetRows.push(['FECHA', 'PROD Ud', 'REND HH/Ud', 'ESTUDIO HH/Ud', 'DESVÍO HH/Ud', '']);
      prodSheetRows.push(['TOTAL', totalProd, avgRend, avgEstudio, +(avgRend - avgEstudio).toFixed(2), '']);
      g.days.forEach(d => {
        const rend = d.prod > 0 ? +(d.hh / d.prod).toFixed(2) : 0;
        prodSheetRows.push([d.date, d.prod, rend, d.estudio, +(rend - d.estudio).toFixed(2), '']);
      });
      prodSheetRows.push(['', '', '', '', '', '']);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(prodSheetRows);
    XLSX.utils.book_append_sheet(wb, ws3, 'Producción Rendimientos');

    XLSX.writeFile(wb, `Rendimientos_S${week}_PSFV_SanPedro.xlsx`);
  }, [week, personalData, maquinariaData, produccionData]);

  const exportCSV = useCallback(() => {
    let rows: string[][] = [];
    if (subTab === 'personal') {
      rows = [['ACTIVIDAD', ...DAY_LABELS, 'TOTAL'], ...personalData.map(a => [a.name, ...a.hh.map(String), String(sumArr(a.hh))])];
    } else if (subTab === 'maquinaria') {
      rows = [['MÁQUINA', ...DAY_LABELS, 'TOTAL', 'ESTADO'], ...maquinariaData.map(m => [m.name, ...m.hh.map(String), String(sumArr(m.hh)), m.status])];
    } else {
      rows = [['ACTIVIDAD', 'PROD Ud', 'REND HH/Ud', 'ESTUDIO HH/Ud', 'DESVÍO HH/Ud']];
      produccionData.forEach(g => g.days.forEach(d => {
        const rend = d.prod > 0 ? +(d.hh / d.prod).toFixed(2) : 0;
        rows.push([g.activity, String(d.prod), String(rend), String(d.estudio), String(+(rend - d.estudio).toFixed(2))]);
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
  }, [subTab, week, personalData, maquinariaData, produccionData]);

  const desvioStyle = (val: number) => {
    if (val > 0) return { background: '#FFCDD2', color: '#c62828' };
    if (val < 0) return { background: '#C8E6C9', color: '#2e7d32' };
    return { background: '#eee', color: '#666' };
  };

  const hasData = personalData.length > 0 || maquinariaData.some(m => sumArr(m.hh) > 0);

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

      {!hasData && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-[13px] font-bold mb-1" style={{ color: 'hsl(var(--navy))' }}>Sin datos de parte</p>
          <p className="text-[11px] text-muted-foreground">Completa los pasos 1-4 del parte diario para ver rendimientos reales aquí.</p>
        </div>
      )}

      {/* Tables */}
      <div className="overflow-x-auto rounded-2xl" style={{ boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
        {subTab === 'personal' && personalData.length > 0 && (
          <table className="w-full text-[11px] min-w-[500px]">
            <thead>
              <tr style={{ background: BRAND }}>
                <th className="text-left text-white font-bold py-2 px-2 whitespace-nowrap">ACTIVIDAD</th>
                {DAY_LABELS.map(d => <th key={d} className="text-center text-white font-bold py-2 px-1.5">{d}</th>)}
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
                {DAY_LABELS.map((_, i) => (
                  <td key={i} className="text-center py-2 px-1.5 font-bold font-mono text-white">
                    {personalData.reduce((s, a) => s + a.hh[i], 0) || '—'}
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
                {DAY_LABELS.map(d => <th key={d} className="text-center text-white font-bold py-2 px-1.5">{d}</th>)}
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
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                      style={{ background: m.status === 'OK' ? '#16a34a' : '#e53e3e' }}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {subTab === 'produccion' && produccionData.length > 0 && (
          <div className="space-y-3">
            {produccionData.map(g => {
              const totalProd = g.days.reduce((s, d) => s + d.prod, 0);
              const totalHH = g.days.reduce((s, d) => s + d.hh, 0);
              const avgRend = totalProd > 0 ? +(totalHH / totalProd).toFixed(2) : 0;
              const avgEstudio = g.days[0]?.estudio || 0;
              const totalDesvio = +(avgRend - avgEstudio).toFixed(2);

              return (
                <div key={g.activity} className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
                  <div className="py-2 px-3 font-bold text-white text-[12px]" style={{ background: BRAND }}>{g.activity}</div>
                  <table className="w-full text-[11px] min-w-[440px]">
                    <thead>
                      <tr style={{ background: '#f0f0f0' }}>
                        <th className="text-left py-1.5 px-2 font-bold">Día</th>
                        <th className="text-center py-1.5 px-1.5 font-bold">PROD Ud</th>
                        <th className="text-center py-1.5 px-1.5 font-bold">REND HH/Ud</th>
                        <th className="text-center py-1.5 px-1.5 font-bold">ESTUDIO HH/Ud</th>
                        <th className="text-center py-1.5 px-2 font-bold">DESVÍO HH/Ud</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#E8F5E9', fontWeight: 700 }}>
                        <td className="py-2 px-2">TOTAL</td>
                        <td className="text-center py-2 px-1.5 font-mono">{totalProd}</td>
                        <td className="text-center py-2 px-1.5 font-mono">{avgRend}</td>
                        <td className="text-center py-2 px-1.5 font-mono">{avgEstudio}</td>
                        <td className="text-center py-2 px-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold" style={desvioStyle(totalDesvio)}>
                            {totalDesvio > 0 ? '+' : ''}{totalDesvio}
                          </span>
                        </td>
                      </tr>
                      {g.days.map((d, i) => {
                        const rend = d.prod > 0 ? +(d.hh / d.prod).toFixed(2) : 0;
                        const desvio = +(rend - d.estudio).toFixed(2);
                        return (
                          <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                            <td className="py-1.5 px-2 font-mono">{d.date}</td>
                            <td className="text-center py-1.5 px-1.5 font-mono">{d.prod || '—'}</td>
                            <td className="text-center py-1.5 px-1.5 font-mono">{rend || '—'}</td>
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
