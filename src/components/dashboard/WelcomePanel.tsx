// ============================================================
// FILE: src/components/dashboard/WelcomePanel.tsx
// DESKRIPSI: Panel selamat datang di bagian atas dashboard.
//
// KONTEN:
//   - Salam personal dengan nama user (animasi fade-in)
//   - Avatar lingkaran dengan inisial nama
//   - Status CV: nama file + tanggal upload + tombol "Perbarui CV"
//   - Chip bidang karier yang direkomendasikan AI
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserSession } from '../../types/dashboard';
import { UserAvatar } from './DashboardSidebar';

interface WelcomePanelProps {
  user: UserSession;
  recommendedField: string; // Bidang karier utama dari output AI
  language: string;
  onAvatarClick?: () => void;
  onUpload?: (file: File) => void;
}

const WelcomePanel: React.FC<WelcomePanelProps> = ({ user, recommendedField, language, onAvatarClick, onUpload }) => {
  // State untuk animasi fade-in saat komponen pertama kali muncul
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay kecil agar animasi terlihat saat halaman dimuat
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Menentukan sapaan berdasarkan jam saat ini
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (language === 'id') {
      if (hour < 12) return 'Selamat Pagi';
      if (hour < 15) return 'Selamat Siang';
      if (hour < 18) return 'Selamat Sore';
      return 'Selamat Malam';
    } else {
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    }
  };

  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Kartu utama welcome dengan gradient lembut */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001734] to-[#003875] p-6 md:p-8 shadow-lg">

        {/* Dekorasi lingkaran background (efek premium) */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          {/* ── Bagian Kiri: Avatar & Teks Salam (Selalu berdampingan) ── */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            {/* Avatar Photo */}
            <button 
              onClick={onAvatarClick}
              className="flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 rounded-full focus:outline-none"
              title={language === 'id' ? 'Klik untuk memperbesar foto' : 'Click to zoom photo'}
            >
              <UserAvatar name={user.name} size="lg" />
            </button>

            {/* Teks Salam & Info */}
            <div className="min-w-0">
              {/* Sapaan dinamis */}
              <p className="text-blue-200 text-[10px] sm:text-[11px] font-bold mb-0.5 uppercase tracking-widest leading-none">
                {getGreeting()}
              </p>
              {/* Nama user besar */}
              <h1 className="text-white text-xl sm:text-2xl font-bold truncate leading-tight">
                {user.name}
              </h1>

              {/* Chip bidang karier AI */}
              <div className="mt-2 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5 max-w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse shrink-0" />
                <span className="text-white/95 text-[11px] font-medium truncate">{recommendedField}</span>
              </div>
            </div>
          </div>

          {/* ── Bagian Kanan: Status CV & Tombol (Mobile: berjajar horisontal / Desktop: vertikal kanan) ── */}
          <div className="flex flex-row flex-wrap items-center gap-3 lg:flex-col lg:items-end lg:text-right pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
            {user.hasCv ? (
              <div className="flex flex-col gap-1 items-start lg:items-end">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 border border-white/5">
                  {/* Ikon file */}
                  <svg className="w-3.5 h-3.5 text-blue-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {user.cvs && user.cvs.length > 0 ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000'}/uploads/${user.cvs[0].filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-[11.5px] font-medium truncate max-w-[150px] hover:underline"
                    >
                      {user.cvs[0].originalName || 'CV Anda'}
                    </a>
                  ) : (
                    <span className="text-white text-[11.5px] font-medium truncate max-w-[150px]">
                      CV Anda
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-[10px] pl-1 lg:pl-0">
                  {language === 'id' ? 'Telah Diunggah' : 'Uploaded'}
                </p>
              </div>
            ) : (
              // Jika belum ada CV, tampilkan prompt untuk upload
              <div className="bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-white text-[11px] flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{language === 'id' ? 'Belum ada CV diunggah' : 'No CV uploaded yet'}</span>
              </div>
            )}

            {/* Tombol upload/perbarui CV */}
            {onUpload ? (
              <label className="inline-flex items-center gap-1.5 bg-white text-[#001734] px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-blue-50 transition-all shadow-md active:scale-95 cursor-pointer">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>
                  {language === 'id'
                    ? (user.hasCv ? 'Perbarui CV' : 'Unggah CV')
                    : (user.hasCv ? 'Update CV' : 'Upload CV')}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onUpload(e.target.files[0]);
                    }
                  }} 
                />
              </label>
            ) : (
              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 bg-white text-[#001734] px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-blue-50 transition-all shadow-md active:scale-95"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>
                  {language === 'id'
                    ? (user.cvFileName ? 'Perbarui CV' : 'Unggah CV')
                    : (user.cvFileName ? 'Update CV' : 'Upload CV')}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;
