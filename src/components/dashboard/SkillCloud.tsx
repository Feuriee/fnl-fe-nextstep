// ============================================================
// FILE: src/components/dashboard/SkillCloud.tsx
// DESKRIPSI: Tampilan tag-tag skill yang terdeteksi dari CV user.
//
// FITUR:
//   - Setiap tag muncul dengan animasi staggered (delay bertahap)
//   - Warna tag bervariasi berdasarkan kategori skill
//   - Menampilkan SEMUA skill (tidak dikunci seperti di UploadPage)
// ============================================================

import { useEffect, useState } from 'react';

interface SkillCloudProps {
  skills: string[];   // Daftar skill dari output AI
  language: string;
}

// Kategorisasi skill untuk pewarnaan yang berbeda (Tema Navy & White)
const getSkillStyle = (skill: string): string => {
  const lower = skill.toLowerCase();

  // Bahasa pemrograman — Navy gelap
  if (['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'php', 'ruby'].some(s => lower.includes(s))) {
    return 'bg-[#F0F4FA] text-[#001734] border border-[#001734]/15';
  }
  // Framework / Library — Medium Navy
  if (['react', 'vue', 'angular', 'node', 'next', 'express', 'django', 'flask', 'spring'].some(s => lower.includes(s))) {
    return 'bg-[#E5EDFF] text-[#002C59] border border-[#002C59]/15';
  }
  // Database / Cloud — Slate
  if (['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'gcp', 'azure', 'docker', 'kubernetes'].some(s => lower.includes(s))) {
    return 'bg-slate-50 text-slate-800 border border-slate-200';
  }
  // Soft skills — Muted Gray
  if (['leadership', 'communication', 'problem', 'agile', 'scrum', 'teamwork', 'management'].some(s => lower.includes(s))) {
    return 'bg-gray-50 text-gray-700 border border-gray-250';
  }
  // Default — White / border
  return 'bg-white text-gray-500 border border-gray-200';
};

const SkillCloud: React.FC<SkillCloudProps> = ({ skills, language }) => {
  // State untuk melacak skill mana saja yang sudah visible (untuk animasi staggered)
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Tampilkan skill satu per satu dengan delay 60ms
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= skills.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, [skills.length]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Brain SVG icon instead of emoji */}
          <svg className="w-4.5 h-4.5 text-[#001734] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-[14px] font-bold text-[#001734]">
            {language === 'id' ? 'Skill Terdeteksi di CV' : 'Detected CV Skills'}
          </h3>
        </div>
        {/* Badge jumlah total skill */}
        <span className="bg-[#001734] text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10">
          {skills.length} {language === 'id' ? 'skill' : 'skills'}
        </span>
      </div>

      {/* Grid tag skill — muncul satu per satu */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={skill}
            className={`
              px-3 py-1.5 rounded-full text-[12px] font-semibold
              transition-all duration-300
              ${getSkillStyle(skill)}
              ${index < visibleCount
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-75 translate-y-2'}
            `}
            style={{ transitionDelay: `${index * 30}ms` }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Legenda kategori warna */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3 text-[11px] text-gray-500 font-medium">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#001734]" /> {language === 'id' ? 'Bahasa Pemrograman' : 'Programming Language'}</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#002C59]" /> Framework</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> {language === 'id' ? 'Database & Cloud' : 'Database & Cloud'}</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Soft Skill</span>
      </div>
    </div>
  );
};

export default SkillCloud;
