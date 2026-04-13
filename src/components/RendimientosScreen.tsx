import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const BRAND = '#007C58';

// --- DUMMY DATA ---
const WEEK_DAYS = ['01-08-25', '02-08-25', '03-08-25', '04-08-25', '05-08-25', '06-08-25'];
const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const PERSONAL_ACTIVITIES = [
  { name: 'Hincado principal', hh: [12, 14, 11, 13, 15, 8] },
  { name: 'Lima y pintura', hh: [6, 7, 5.5, 6.5, 7, 4] },
  { name: 'Micropilotes', hh: [18, 20, 17, 19, 21, 10] },
  { name: 'POT', hh: [4, 3.5, 4.5, 4, 5, 2] },
  { name: 'Cableado', hh: [8, 9, 7.5, 8.5, 9, 5] },
  { name: 'Estructura', hh: [10, 11, 9, 10, 12, 6] },
  { name: 'Módulos', hh: [5, 6, 4.5, 5.5, 6, 3] },
  { name: 'Trackers', hh: [14, 15, 13, 14, 16, 8] },
];

const MAQUINARIA_ROWS = [
  { name: 'Hincadora Turchi', hh: [8, 8, 7, 8, 8, 4], status: 'OK' },
  { name: 'Manitou 17M', hh: [6, 7, 6, 7, 7, 3], status: 'OK' },
  { name: 'JCB 540-170', hh: [5, 6, 5, 0, 6, 3], status: 'STOP' },
  { name: 'Bobcat TL 35.70', hh: [7, 7, 7, 7, 8, 4], status: 'OK' },
  { name: 'Grúa Liebherr LTM', hh: [4, 5, 4, 5, 5, 2], status: 'OK' },
  { name: 'Retroexcavadora CAT', hh: [6, 6, 5, 6, 7, 3], status: 'OK' },
];

interface ProdGroup {
  activity: string;
  days: { date: string; prod: number; rend: number; estudio: number }[];
}

const PRODUCCION_DATA: ProdGroup[] = [
  {
    activity: 'HINCADO',
    days: [
      { date: '01-08-25', prod: 10, rend: 2.5, estudio: 1.0 },
      { date: '02-08-25', prod: 12, rend: 2.3, estudio: 1.0 },
      { date: '03-08-25', prod: 8, rend: 2.8, estudio: 1.0 },
      { date: '04-08-25', prod: 11, rend: 2.4, estudio: 1.0 },
      { date: '05-08-25', prod: 10, rend: 2.6, estudio: 1.0 },
      { date: '06-08-25', prod: 6, rend: 3.0, estudio: 1.0 },
    ],
  },
  {
    activity: 'PERFORACIÓN',
    days: [
      { date: '01-08-25', prod: 60, rend: 4.0, estudio: 5.0 },
      { date: '02-08-25', prod: 55, rend: 4.2, estudio: 5.0 },
      { date: '03-08-25', prod: 62, rend: 3.8, estudio: 5.0 },
      { date: '04-08-25', prod: 58, rend: 4.1, estudio: 5.0 },
      { date: '05-08-25', prod: 65, rend: 3.9, estudio: 5.0 },
      { date: '06-08-25', prod: 30, rend: 4.5, estudio: 5.0 },
    ],
  },
  {
    activity: 'MICROPILOTES',
    days: [
      { date: '01-08-25', prod: 25, rend: 3.2, estudio: 3.0 },
      { date: '02-08-25', prod: 28, rend: 3.0, estudio: 3.0 },
      { date: '03-08-25', prod: 22, rend: 3.4, estudio: 3.0 },
      { date: '04-08-25', prod: 26, rend: 3.1, estudio: 3.0 },
      { date: '05-08-25', prod: 27, rend: 3.3, estudio: 3.0 },
      { date: '06-08-25', prod: 14, rend: 3.5, estudio: 3.0 },
    ],
  },
];

const sumArr = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const RendimientosScreen = () => {
  const [subTab, setSubTab] = useState<'personal' | 'maquinaria' | 'produccion'>('personal');
  const [week, setWeek] = useState(32);

  const subTabs = [
    { id: 'personal' as const, label: 'Personal' },
    { id: 'maquinaria' as const, label: 'Maquinaria' },
    { id: 'produccion' as const, label: 'Producción' },
  ];

  // --- Export ---
  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Horas Personal
    const pHeader = ['ACTIVIDAD', ...DAY_LABELS, 'TOTAL'];
    const pRows = PERSONAL_ACTIVITIES.map(a => [a.name, ...a.hh, sumArr(a.hh)]);
    const pTotals = ['TOTAL', ...DAY_LABELS.map((_, i) => PERSONAL_ACTIVITIES.reduce((s, a) => s + a.hh[i], 0)), PERSONAL_ACTIVITIES.reduce((s, a) => s + sumArr(a.hh), 0)];
    const ws1 = XLSX.utils.aoa_to_sheet([['MARACOF — PSFV San Pedro', '', '', '', '', '', '', `Semana ${week}`], [], pHeader, ...pRows, pTotals]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Horas Personal');

    // Sheet 2: Horas Maquinaria
    const mHeader = ['MÁQUINA', ...DAY_LABELS, 'TOTAL', 'ESTADO'];
    const mRows = MAQUINARIA_ROWS.map(m => [m.name, ...m.hh, sumArr(m.hh), m.status]);
    const ws2 = XLSX.utils.aoa_to_sheet([['MARACOF — PSFV San Pedro', '', '', '', '', '', '', '', `Semana ${week}`], [], mHeader, ...mRows]);
    XLSX.utils.book_append_sheet(wb, ws2, 'Horas Maquinaria');

    // Sheet 3: Producción Rendimientos
    const prodRows: (string | number)[][] = [['MARACOF — PSFV San Pedro', '', '', '', '', `Semana ${week}`], []];
    PRODUCCION_DATA.forEach(g => {
      const totalProd = g.days.reduce((s, d) => s + d.prod, 0);
      const totalHH = g.days.reduce((s, d) => s + d.prod * d.rend, 0);
      const avgRend = totalProd > 0 ? totalHH / totalProd : 0;
      const avgEstudio = g.days[0].estudio;
      prodRows.push([g.activity, '', '', '', '', '']);
      prodRows.push(['FECHA', 'PROD Ud', 'REND HH/Ud', 'ESTUDIO HH/Ud', 'DESVÍO HH/Ud', '']);
      prodRows.push(['TOTAL', totalProd, +avgRend.toFixed(2), avgEstudio, +(avgRend - avgEstudio).toFixed(2), '']);
      g.days.forEach(d => {
        prodRows.push([d.date, d.prod, d.rend, d.estudio, +(d.rend - d.estudio).toFixed(2), '']);
      });
      prodRows.push(['', '', '', '', '', '']);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(prodRows);
    XLSX.utils.book_append_sheet(wb, ws3, 'Producción Rendimientos');

    XLSX.writeFile(wb, `Rendimientos_S${week}_PSFV_SanPedro.xlsx`);
  }, [week]);

  const exportCSV = useCallback(() => {
    let rows: string[][] = [];
    if (subTab === 'personal') {
      rows = [['ACTIVIDAD', ...DAY_LABELS, 'TOTAL'], ...PERSONAL_ACTIVITIES.map(a => [a.name, ...a.hh.map(String), String(sumArr(a.hh))])];
    } else if (subTab === 'maquinaria') {
      rows = [['MÁQUINA', ...DAY_LABELS, 'TOTAL', 'ESTADO'], ...MAQUINARIA_ROWS.map(m => [m.name, ...m.hh.map(String), String(sumArr(m.hh)), m.status])];
    } else {
      rows = [['ACTIVIDAD', 'FECHA', 'PROD Ud', 'REND HH/Ud', 'ESTUDIO HH/Ud', 'DESVÍO HH/Ud']];
      PRODUCCION_DATA.forEach(g => g.days.forEach(d => rows.push([g.activity, d.date, String(d.prod), String(d.rend), String(d.estudio), String(+(d.rend - d.estudio).toFixed(2))])));
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rendimientos_${subTab}_S${week}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [subTab, week]);

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
                {DAY_LABELS.map(d => <th key={d} className="text-center text-white font-bold py-2 px-1.5">{d}</th>)}
                <th className="text-center text-white font-bold py-2 px-2">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {PERSONAL_ACTIVITIES.map((a, i) => (
                <tr key={a.name} style={{ background: i % 2 === 0 ? '#fff' : '#E8F5E9' }}>
                  <td className="py-2 px-2 font-semibold whitespace-nowrap">{a.name}</td>
                  {a.hh.map((v, j) => <td key={j} className="text-center py-2 px-1.5 font-mono">{v}</td>)}
                  <td className="text-center py-2 px-2 font-bold font-mono">{sumArr(a.hh)}</td>
                </tr>
              ))}
              <tr style={{ background: BRAND }}>
                <td className="py-2 px-2 font-bold text-white">TOTAL</td>
                {DAY_LABELS.map((_, i) => (
                  <td key={i} className="text-center py-2 px-1.5 font-bold font-mono text-white">
                    {PERSONAL_ACTIVITIES.reduce((s, a) => s + a.hh[i], 0)}
                  </td>
                ))}
                <td className="text-center py-2 px-2 font-bold font-mono text-white">
                  {PERSONAL_ACTIVITIES.reduce((s, a) => s + sumArr(a.hh), 0)}
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
              {MAQUINARIA_ROWS.map((m, i) => (
                <tr key={m.name} style={{ background: i % 2 === 0 ? '#fff' : '#E8F5E9' }}>
                  <td className="py-2 px-2 font-semibold whitespace-nowrap">{m.name}</td>
                  {m.hh.map((v, j) => <td key={j} className="text-center py-2 px-1.5 font-mono">{v}</td>)}
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

        {subTab === 'produccion' && (
          <div className="space-y-3">
            {PRODUCCION_DATA.map(g => {
              const totalProd = g.days.reduce((s, d) => s + d.prod, 0);
              const totalHH = g.days.reduce((s, d) => s + d.prod * d.rend, 0);
              const avgRend = totalProd > 0 ? +(totalHH / totalProd).toFixed(2) : 0;
              const avgEstudio = g.days[0].estudio;
              const totalDesvio = +(avgRend - avgEstudio).toFixed(2);

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
                        const desvio = +(d.rend - d.estudio).toFixed(2);
                        return (
                          <tr key={d.date} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                            <td className="py-1.5 px-2 font-mono">{d.date}</td>
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
