import { useEffect, useState } from 'react';
import type { MarketTrend } from '../../types/dashboard';

interface MarketTrendWidgetProps {
  trends: MarketTrend[];
  language: string;
}

// ── Ikon SVG untuk Tren Arah ──────────────────────────────────
const IconArrowUp = () => (
  <svg className="w-3.5 h-3.5 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const IconArrowDown = () => (
  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const IconArrowStable = () => (
  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const MarketTrendWidget: React.FC<MarketTrendWidgetProps> = ({ trends, language }) => {
  // State animasi bar — dimulai dari 0% lebar
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animasi setelah sedikit delay
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Ikon dan warna untuk setiap arah tren (Tema Navy & White)
  const getTrendIndicator = (tren: MarketTrend['tren']) => {
    if (tren === 'naik') return { Icon: IconArrowUp, color: 'bg-[#F0F4FA] border border-[#001734]/10', label: language === 'id' ? 'Naik' : 'Rising' };
    if (tren === 'turun') return { Icon: IconArrowDown, color: 'bg-gray-50 border border-gray-150', label: language === 'id' ? 'Turun' : 'Falling' };
    return { Icon: IconArrowStable, color: 'bg-gray-50 border border-gray-150', label: language === 'id' ? 'Stabil' : 'Stable' };
  };

  // Warna bar progress (Tema Navy & White)
  const getBarColor = (persen: number) => {
    if (persen >= 90) return 'bg-[#001734]';
    if (persen >= 80) return 'bg-[#002C59]';
    return 'bg-slate-300';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {/* Trend up SVG icon instead of emoji */}
          <svg className="w-4 h-4 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="text-[14px] font-bold text-[#001734]">
            {language === 'id' ? 'Tren Pasar Kerja 2026' : 'Job Market Trends 2026'}
          </h3>
        </div>
        {/* Label periode data */}
        <span className="text-[11px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
          {language === 'id' ? 'Data Terkini' : 'Latest Data'}
        </span>
      </div>

      {/* Daftar skill dengan bar progress */}
      <div className="space-y-4">
        {trends.map((trend, i) => {
          const indicator = getTrendIndicator(trend.tren);
          return (
            <div key={trend.skill} className="group">
              {/* Baris nama skill + persentase + indikator tren */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-semibold text-gray-700">{trend.skill}</span>
                <div className="flex items-center gap-2">
                  {/* Persentase */}
                  <span className="text-[12px] font-bold text-[#001734]">{trend.persentase}%</span>
                  {/* Indikator tren naik/turun/stabil */}
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${indicator.color}`}
                    title={indicator.label}
                  >
                    <indicator.Icon />
                  </div>
                </div>
              </div>

              {/* Bar progress horizontal */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(trend.persentase)}`}
                  style={{
                    width: animated ? `${trend.persentase}%` : '0%',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda arah tren */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-[#F0F4FA] border border-[#001734]/10 flex items-center justify-center shrink-0">
            <IconArrowUp />
          </span>
          <span>{language === 'id' ? 'Naik' : 'Rising'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-gray-50 border border-gray-150 flex items-center justify-center shrink-0">
            <IconArrowStable />
          </span>
          <span>{language === 'id' ? 'Stabil' : 'Stable'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-gray-50 border border-gray-150 flex items-center justify-center shrink-0">
            <IconArrowDown />
          </span>
          <span>{language === 'id' ? 'Turun' : 'Falling'}</span>
        </span>
      </div>
    </div>
  );
};

export default MarketTrendWidget;
