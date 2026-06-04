// ============================================================
// FILE: src/components/dashboard/MatchScoreGauge.tsx
// DESKRIPSI: Visualisasi skor kecocokan CV dengan animasi lingkaran SVG.
//
// CARA KERJA:
//   - Menerima nilai `score` (0-100) dan menampilkannya sebagai
//     lingkaran SVG yang terisi secara animasi saat komponen dimuat.
//   - Warna berubah berdasarkan range skor:
//     ≥ 85: hijau emerald (sangat cocok)
//     ≥ 70: biru (cocok)
//     < 70: kuning (perlu improvement)
// ============================================================

import { useEffect, useState } from 'react';

interface MatchScoreGaugeProps {
  score: number;    // Nilai 0-100
  language: string;
}

const MatchScoreGauge: React.FC<MatchScoreGaugeProps> = ({ score, language }) => {
  // State untuk animasi — dimulai dari 0, kemudian naik ke nilai score
  const [displayScore, setDisplayScore] = useState(0);
  const [animatedStroke, setAnimatedStroke] = useState(0);

  // Parameter lingkaran SVG
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // Keliling lingkaran

  useEffect(() => {
    // Animasi counter angka skor
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayScore(Math.round(eased * score));
      setAnimatedStroke(eased * (circumference * (score / 100)));

      if (progress < 1) requestAnimationFrame(animate);
    };

    // Delay kecil agar animasi tidak langsung jalan saat unmount
    const timer = setTimeout(() => requestAnimationFrame(animate), 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  // Tentukan warna berdasarkan skor (Tema Navy & White)
  const getColor = () => {
    if (score >= 85) return { stroke: '#001734', text: 'text-[#001734]', bg: 'bg-[#F0F4FA] border border-[#001734]/10', label: language === 'id' ? 'Sangat Cocok' : 'Excellent Match' };
    if (score >= 70) return { stroke: '#002C59', text: 'text-[#002C59]', bg: 'bg-[#E5EDFF] border border-[#002C59]/10', label: language === 'id' ? 'Cocok' : 'Good Match' };
    return { stroke: '#64748B', text: 'text-slate-500', bg: 'bg-slate-50 border border-slate-200', label: language === 'id' ? 'Perlu Perbaikan' : 'Needs Improvement' };
  };

  const color = getColor();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Judul widget */}
      <div className="flex items-center gap-2 mb-4">
        {/* Target SVG icon instead of emoji */}
        <svg className="w-4.5 h-4.5 text-[#001734] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-[14px] font-bold text-[#001734]">
          {language === 'id' ? 'Skor Kecocokan CV' : 'CV Match Score'}
        </h3>
      </div>

      {/* Lingkaran SVG animasi */}
      <div className="flex flex-col items-center">
        <div className="relative w-[140px] h-[140px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Lingkaran latar (abu-abu) */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="10"
            />
            {/* Lingkaran progres (terisi dengan animasi) */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color.stroke}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - animatedStroke}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>

          {/* Angka di tengah lingkaran */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${color.text}`}>{displayScore}</span>
            <span className="text-[11px] text-gray-400 font-medium">/ 100</span>
          </div>
        </div>

        {/* Label status skor */}
        <div className={`mt-3 px-4 py-1.5 rounded-full text-[12px] font-semibold ${color.bg} ${color.text}`}>
          {color.label}
        </div>

        {/* Penjelasan singkat */}
        <p className="mt-3 text-center text-[12px] text-gray-500 leading-relaxed">
          {language === 'id'
            ? 'Rata-rata kecocokan CV kamu dengan seluruh lowongan yang direkomendasikan'
            : 'Average match between your CV and all recommended job positions'}
        </p>
      </div>
    </div>
  );
};

export default MatchScoreGauge;
