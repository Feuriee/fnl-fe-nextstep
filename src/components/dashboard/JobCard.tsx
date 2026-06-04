// ============================================================
// FILE: src/components/dashboard/JobCard.tsx
// DESKRIPSI: Kartu reusable untuk satu rekomendasi lowongan pekerjaan.
//
// FITUR:
//   - Badge skor kecocokan dengan warna dinamis
//   - Tombol "Simpan" — menyimpan lowongan ke localStorage
//   - Tombol "Lamar" — membuka link lowongan di tab baru
//   - Animasi hover: naik sedikit + shadow
//   - Indikator "Tersimpan" jika sudah ada di savedJobs
//
// CATATAN BACKEND:
//   - Field `url` idealnya diisi dengan link lowongan asli dari database/API
//   - Setelah API siap, lowongan tersimpan bisa dikirim ke endpoint
//     POST /api/users/saved-jobs agar tersimpan di server, bukan hanya localStorage
// ============================================================

import { useState, useEffect } from 'react';
import type { JobRecommendation, SavedJob } from '../../types/dashboard';
import { STORAGE_KEYS } from '../../utils/mockData';
import { savedJobApi } from '../../services/api';

interface JobCardProps {
  job: JobRecommendation;
  index: number;     // Urutan kartu — dipakai untuk animasi staggered
  language: string;
  onSaveToggle?: () => void; // Callback ketika status simpan berubah
}

const JobCard: React.FC<JobCardProps> = ({ job, index, language, onSaveToggle }) => {
  // Cek apakah lowongan ini sudah disimpan oleh user
  const [isSaved, setIsSaved] = useState(false);
  const [saveAnimating, setSaveAnimating] = useState(false);

  useEffect(() => {
    // Baca daftar savedJobs dari localStorage saat komponen mount
    const saved = localStorage.getItem(STORAGE_KEYS.LOCAL_SAVED_JOBS);
    if (saved) {
      const savedJobs: SavedJob[] = JSON.parse(saved);
      // Cek berdasarkan posisi + perusahaan (sebagai identifier unik)
      setIsSaved(savedJobs.some(j => j.posisi === job.posisi && j.perusahaan === job.perusahaan));
    }
  }, [job.posisi, job.perusahaan]);

  // Fungsi simpan/hapus lowongan dari API
  const handleSave = async () => {
    setSaveAnimating(true);
    setTimeout(() => setSaveAnimating(false), 400);

    try {
      if (isSaved) {
        // Hapus dari backend
        await savedJobApi.unsaveByQuery(job.posisi, job.perusahaan);
        setIsSaved(false);
      } else {
        // Tambahkan ke backend
        await savedJobApi.save({
          posisi: job.posisi,
          perusahaan: job.perusahaan,
          industri: job.industri,
          skor_match: job.skor_match,
          saran_belajar: job.saran_belajar,
          link_lamaran: job.link_lamaran,
          link_belajar: job.link_belajar,
          lokasi: job.lokasi,
          tipe_kerja: job.tipe_kerja,
        });
        setIsSaved(true);
      }

      if (onSaveToggle) {
        onSaveToggle();
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
      // Bisa tambahkan toast error di sini jika perlu
    }
  };

  // Warna badge skor berdasarkan nilai (Tema Navy & White)
  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-[#001734] text-white border border-[#001734]';
    if (score >= 80) return 'bg-[#E5EDFF] text-[#001734] border border-[#001734]/10';
    return 'bg-gray-50 text-gray-500 border border-gray-200';
  };

  // Ikon dan warna berdasarkan tipe kerja (Tema Navy & White)
  const getWorkTypeBadge = (tipe?: string) => {
    if (!tipe) return null;
    const lower = tipe.toLowerCase();
    if (lower.includes('remote')) return 'bg-gray-100 text-[#001734] border border-gray-200';
    if (lower.includes('hybrid')) return 'bg-[#F0F4FA] text-[#001734] border border-[#001734]/5';
    return 'bg-gray-50 text-gray-500 border border-gray-200';
  };

  return (
    <div
      className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

        {/* Nomor urutan + ikon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#001734] to-[#003875] flex items-center justify-center text-white text-[13px] font-bold shadow-sm">
          #{index + 1}
        </div>

        {/* Konten utama */}
        <div className="flex-1 min-w-0">
          {/* Baris atas: Nama posisi + badge skor */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-[15px] font-bold text-[#001734] truncate">{job.posisi}</h4>
              <p className="text-[13px] text-gray-500 mt-0.5">{job.perusahaan}</p>
            </div>
            {/* Badge skor kecocokan */}
            <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${getScoreBadge(job.skor_match)}`}>
              {job.skor_match.toFixed(1)}% {language === 'id' ? 'cocok' : 'match'}
            </span>
          </div>

          {/* Baris metadata: Industri, Lokasi, Tipe Kerja, Gaji */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {/* Industri */}
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {job.industri}
            </span>

            {/* Lokasi */}
            {job.lokasi && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.lokasi}
              </span>
            )}

            {/* Tipe Kerja */}
            {job.tipe_kerja && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getWorkTypeBadge(job.tipe_kerja)}`}>
                {job.tipe_kerja}
              </span>
            )}
          </div>

          {/* Gaji */}
          {job.gaji && (
            <div className="mt-2.5 flex items-center gap-1 text-[12px] font-bold text-[#001734]">
              {/* Money SVG Icon */}
              <svg className="w-4 h-4 text-[#001734] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{job.gaji}</span>
            </div>
          )}

          {/* Skill yang perlu dipelajari (chip kecil) */}
          {job.saran_belajar && job.saran_belajar.length > 0 && (
            <div className="mt-3.5">
              <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1.5 font-medium">
                {/* Book/Academic SVG Icon */}
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{language === 'id' ? 'Skill yang perlu dipelajari:' : 'Skills to learn:'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.saran_belajar.map((skill, i) => {
                  const learnUrl = job.link_belajar && job.link_belajar[i] ? job.link_belajar[i] : null;
                  
                  if (learnUrl) {
                    return (
                      <a 
                        key={skill} 
                        href={learnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F0F4FA] text-[#001734] text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-[#001734]/10 hover:bg-[#E5EDFF] transition-colors cursor-pointer inline-flex items-center gap-1 group/skill"
                      >
                        {skill}
                        <svg className="w-3 h-3 text-[#001734] opacity-50 group-hover/skill:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  }
                  
                  return (
                    <span key={skill} className="bg-[#F0F4FA] text-[#001734] text-[11px] px-2 py-0.5 rounded-full font-medium border border-[#001734]/5">
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Baris aksi: Simpan + Lamar */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        {/* Tombol Simpan */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
            saveAnimating ? 'scale-95' : ''
          } ${
            isSaved
              ? 'bg-[#001734] text-white shadow-sm'
              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <svg className={`w-4 h-4 transition-all ${isSaved ? 'fill-white' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {isSaved
            ? (language === 'id' ? 'Tersimpan' : 'Saved')
            : (language === 'id' ? 'Simpan' : 'Save')}
        </button>

        {/* Tombol Lamar — buka link di tab baru */}
        {/* Tombol Lamar — buka link di tab baru */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // 3. Pastikan URL job menggunakan field apply_url atau job_url asli dari database/API
            let targetUrl = job.link_lamaran || job.url || (job as any).apply_url;

            // 6. Tambahkan fallback ke halaman pencarian/detail pekerjaan jika apply_url tidak tersedia
            if (!targetUrl) {
              // Bersihkan string dari spesial karakter agar pencarian LinkedIn tidak crash
              const cleanPosition = job.posisi.replace(/[^\w\s-]/gi, '').trim();
              const query = `${cleanPosition} ${job.perusahaan}`.trim();
              
              // 4. Jika menggunakan keyword search, gunakan encodeURIComponent()
              // 5. Tambahkan validasi jika URL kosong atau invalid
              if (query) {
                targetUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`;
              }
            }

            // 10. Pastikan tombol Apply Now membuka URL eksternal pada tab baru menggunakan window.open
            if (targetUrl) {
              window.open(targetUrl, "_blank", "noopener,noreferrer");
            } else {
              alert(language === 'id' ? 'URL lowongan tidak tersedia.' : 'Job URL is not available.');
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-gradient-to-r from-[#001734] to-[#002C59] text-white hover:opacity-90 transition-all shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {language === 'id' ? 'Lamar Sekarang' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
