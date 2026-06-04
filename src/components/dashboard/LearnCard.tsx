// ============================================================
// FILE: src/components/dashboard/LearnCard.tsx
// DESKRIPSI: Kartu rekomendasi kursus / sumber belajar untuk Skill-Up Hub.
//
// FITUR:
//   - Menampilkan nama kursus, platform, skill target, durasi, rating
//   - Tombol "Mulai Belajar" membuka link kursus di tab baru
//   - Animasi hover subtle
//
// CATATAN BACKEND:
//   - Data ini idealnya berasal dari tabel `learn_resources` di database
//   - Endpoint: GET /api/learn-resources?skills=TypeScript,Docker
// ============================================================

import type { LearnResource } from '../../types/dashboard';

interface LearnCardProps {
  resource: LearnResource;
  index: number;
  language: string;
}

// ── Ikon SVG untuk Platform Belajar ───────────────────────────
const IconCap = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6M3.055 11L12 16.055 20.945 11" />
  </svg>
);

const IconPlay = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconBookOpen = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// Warna background ikon per platform (Tema Navy & White)
const getPlatformStyle = (platform: string): { bg: string; text: string; Icon: React.FC } => {
  const lower = platform.toLowerCase();
  if (lower.includes('dicoding')) return { bg: 'bg-[#F0F4FA] border border-[#001734]/10', text: 'text-[#001734]', Icon: IconCap };
  if (lower.includes('coursera')) return { bg: 'bg-[#F0F4FA] border border-[#001734]/10', text: 'text-[#001734]', Icon: IconCap };
  if (lower.includes('udemy'))   return { bg: 'bg-slate-100 border border-slate-200', text: 'text-slate-700', Icon: IconCap };
  if (lower.includes('youtube')) return { bg: 'bg-red-50 border border-red-100',    text: 'text-red-600',    Icon: IconPlay };
  return { bg: 'bg-gray-50 border border-gray-200', text: 'text-gray-600', Icon: IconBookOpen };
};

const LearnCard: React.FC<LearnCardProps> = ({ resource, index, language }) => {
  const platformStyle = getPlatformStyle(resource.platform);

  const getDynamicUrl = () => {
    const p = resource.platform.toLowerCase();
    const q = encodeURIComponent(resource.skill_target || resource.judul);
    if (p.includes('coursera')) return `https://www.coursera.org/search?query=${q}`;
    if (p.includes('udemy')) return `https://www.udemy.com/courses/search/?src=ukw&q=${q}`;
    if (p.includes('youtube')) return `https://www.youtube.com/results?search_query=${q}+course`;
    if (p.includes('dicoding')) return `https://www.dicoding.com/academies/search?query=${q}`;
    return `https://www.google.com/search?q=${q}+course`;
  };

  // Render bintang rating (0-5)
  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-[11px] text-gray-500 font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Ikon platform */}
        <div className={`w-11 h-11 rounded-xl ${platformStyle.bg} ${platformStyle.text} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <platformStyle.Icon />
        </div>

        <div className="flex-1 min-w-0">
          {/* Nama kursus */}
          <h4 className="text-[14px] font-bold text-[#001734] leading-snug">{resource.judul}</h4>

          {/* Platform + rating */}
          <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${platformStyle.bg} ${platformStyle.text}`}>
              {resource.platform}
            </span>
            {renderStars(resource.rating)}
          </div>

          {/* Skill target + durasi */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
            {/* Skill yang ditarget */}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {resource.skill_target}
            </span>

            {/* Durasi */}
            {resource.durasi && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {resource.durasi}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tombol mulai belajar */}
      <a
        href={resource.url || getDynamicUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#001734] to-[#002C59] text-white text-[13px] font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {language === 'id' ? 'Mulai Belajar' : 'Start Learning'}
      </a>
    </div>
  );
};

export default LearnCard;
