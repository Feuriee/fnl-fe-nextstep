// ============================================================
// FILE: src/components/dashboard/DashboardSidebar.tsx
// DESKRIPSI: Sidebar navigasi Dashboard — fixed di kiri (desktop), bottom nav (mobile)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: string;
}

// ── Ikon SVG (Heroicons style) ────────────────────────────────
const IconHome = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconBriefcase = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconBook = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const IconTrendingUp = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconWarning = () => (
  <svg className="w-6 h-6 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ── Daftar Menu ───────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',  labelId: 'Overview',        labelEn: 'Overview',       Icon: IconHome },
  { id: 'jobs',      labelId: 'Lowongan',         labelEn: 'Jobs',           Icon: IconBriefcase },
  { id: 'skills',    labelId: 'Skill-Up Hub',     labelEn: 'Skill-Up Hub',   Icon: IconBook },
  { id: 'trends',    labelId: 'Tren Pasar',       labelEn: 'Market Trends',  Icon: IconTrendingUp },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, onTabChange, language }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  // State untuk modal konfirmasi logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // State untuk pop-up menu profil di mobile
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogoutConfirmed = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <>
      {/* ════ DESKTOP SIDEBAR — fixed, full height ════ */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 bg-[#001734] border-r border-white/8 z-20 overflow-y-auto rounded-tr-3xl">

        {/* Logo — centered exactly in h-[72px] to align with top nav header */}
        <div className="px-6 h-[72px] flex flex-col justify-center border-b border-white/10 flex-shrink-0 rounded-tr-3xl">
          <Link to="/" className="text-[18px] font-bold tracking-tight text-white hover:opacity-75 transition-opacity">
            NextStep
          </Link>
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-[0.15em]">Dashboard</p>
        </div>

        {/* Info User — Klik untuk masuk ke profil */}
        {user && (
          <div
            onClick={() => onTabChange('profile')}
            className={`px-5 py-4 border-b border-white/10 flex-shrink-0 cursor-pointer transition-all duration-200 group/user ${
              activeTab === 'profile'
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
            title={language === 'id' ? 'Lihat Profil' : 'View Profile'}
          >
            <div className="flex items-center gap-3">
              {/* Avatar — photo dari localStorage atau inisial */}
              <UserAvatar name={user.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[13px] text-white truncate group-hover/user:text-blue-300 transition-colors">
                  {user.name}
                </p>
                <p className="text-white/45 text-[11px] truncate">{user.email}</p>
              </div>
              <svg 
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  activeTab === 'profile' ? 'text-white translate-x-0.5' : 'text-white/30 group-hover/user:text-white/70 group-hover/user:translate-x-0.5'
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Navigasi */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, labelId, labelEn, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left group ${
                  isActive
                    ? 'bg-white text-[#001734]'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-[#001734]' : 'text-white/50 group-hover:text-white'}`}>
                  <Icon />
                </span>
                <span className="flex-1">{language === 'id' ? labelId : labelEn}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#001734] flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Tombol Keluar */}
        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <IconLogout />
            {language === 'id' ? 'Keluar' : 'Log Out'}
          </button>
        </div>
      </aside>

      {/* ════ MOBILE BOTTOM NAVIGATION ════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#001734] border-t border-white/10 flex items-stretch">
        {NAV_ITEMS.map(({ id, labelId, labelEn, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-150 relative ${
                isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                <Icon />
              </span>
              <span className="text-[10px] font-medium">{language === 'id' ? labelId : labelEn}</span>
              {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-white rounded-t-full" />}
            </button>
          );
        })}

        {/* Profil Mobile (Ikon Avatar User) */}
        {user && (
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-150 relative ${
              activeTab === 'profile' ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span className={`w-5 h-5 rounded-full overflow-hidden border transition-all duration-150 flex items-center justify-center shrink-0 ${
              activeTab === 'profile' ? 'scale-110 border-white' : 'border-white/20'
            }`}>
              <div className="scale-75 origin-center">
                <UserAvatar name={user.name} size="sm" />
              </div>
            </span>
            <span className="text-[10px] font-medium">{language === 'id' ? 'Profil' : 'Profile'}</span>
            {activeTab === 'profile' && <span className="absolute bottom-0 w-8 h-0.5 bg-white rounded-t-full" />}
          </button>
        )}
      </nav>

      {/* Floating Dropdown Card untuk Menu Profil di Mobile */}
      {showProfileMenu && (
        <>
          {/* Backdrop transparan untuk tutup pop-up jika klik di luar */}
          <div 
            className="fixed inset-0 z-40 bg-black/10 lg:hidden"
            onClick={() => setShowProfileMenu(false)}
          />
          {/* Pop-up Card Dropdown */}
          <div className="fixed bottom-[60px] right-4 z-50 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 animate-fade-in flex flex-col gap-0.5 lg:hidden">
            <button
              onClick={() => {
                onTabChange('profile');
                setShowProfileMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold text-[#001734] hover:bg-gray-50 text-left transition-colors"
            >
              <span className="text-[#001734]">
                <IconUser />
              </span>
              <span>{language === 'id' ? 'Akun Saya' : 'My Account'}</span>
            </button>
            <div className="h-px bg-gray-100 my-0.5" />
            <button
              onClick={() => {
                setShowProfileMenu(false);
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold text-red-600 hover:bg-red-50 text-left transition-colors"
            >
              <span className="text-red-600">
                <IconLogout />
              </span>
              <span>{language === 'id' ? 'Keluar Akun' : 'Log Out'}</span>
            </button>
          </div>
        </>
      )}


      {/* ════ MODAL KONFIRMASI LOGOUT ════ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
            {/* Ikon peringatan */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF3FF] flex items-center justify-center">
                <IconWarning />
              </div>
            </div>
            <h3 className="text-[16px] font-bold text-[#001734] text-center">
              {language === 'id' ? 'Yakin ingin keluar?' : 'Confirm Log Out?'}
            </h3>
            <p className="text-[13px] text-gray-500 text-center mt-1.5 leading-relaxed">
              {language === 'id'
                ? 'Sesi kamu akan berakhir. Kamu perlu login kembali untuk mengakses dashboard.'
                : 'Your session will end. You need to log in again to access the dashboard.'}
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleLogoutConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-[#001734] text-white text-[13px] font-semibold hover:bg-[#002C59] transition-all"
              >
                {language === 'id' ? 'Ya, Keluar' : 'Yes, Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Komponen Avatar reusable ────────────────────────────────
// Mendukung 6 preset karakter lucu (PNG dengan SVG fallback) & 7: upload galeri (Base64)
export const UserAvatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ name, size = 'md' }) => {
  const sizes = { 
    sm: 'w-7 h-7 text-[11px]', 
    md: 'w-9 h-9 text-[13px]', 
    lg: 'w-20 h-20 text-[24px]',
    xl: 'w-full h-full text-[64px]'
  };
  
  const saved = localStorage.getItem('nextstep_avatar');
  const initial = name.charAt(0).toUpperCase();

  // State fallback jika gambar preset PNG belum ada di folder assets
  const [imageError, setImageError] = useState(false);

  // Reset error state ketika item berubah
  useEffect(() => {
    setImageError(false);
  }, [saved]);

  // Definisikan 6 preset SVG Lucu sebagai fallback
  const renderPresetSvg = (presetId: string) => {
    const colorClasses = {
      preset1: 'bg-slate-50 text-slate-700 border-slate-200',
      preset2: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      preset3: 'bg-orange-50 text-orange-700 border-orange-200',
      preset4: 'bg-blue-50 text-blue-700 border-blue-200',
      preset5: 'bg-red-50 text-red-700 border-red-200',
      preset6: 'bg-amber-50 text-amber-700 border-amber-200',
    }[presetId] || 'bg-gray-50 text-gray-600 border-gray-200';

    // SVG lucu/karakter minimalis
    return (
      <div className={`${sizes[size]} rounded-full flex items-center justify-center border font-bold ${colorClasses}`}>
        {presetId === 'preset1' && '💻'}
        {presetId === 'preset2' && '🩺'}
        {presetId === 'preset3' && '👩‍🏫'}
        {presetId === 'preset4' && '💼'}
        {presetId === 'preset5' && '⚖️'}
        {presetId === 'preset6' && '🏛️'}
      </div>
    );
  };

  // Jika avatar adalah salah satu dari 6 preset lucu
  if (saved && saved.startsWith('preset')) {
    const presetId = saved; // 'preset1' - 'preset6'
    const index = presetId.replace('preset', '');
    
    const avatarImgs: Record<string, string> = {
      '1': new URL('../../assets/avatar/cute1.png', import.meta.url).href,
      '2': new URL('../../assets/avatar/cute2.png', import.meta.url).href,
      '3': new URL('../../assets/avatar/cute3.png', import.meta.url).href,
      '4': new URL('../../assets/avatar/cute4.png', import.meta.url).href,
      '5': new URL('../../assets/avatar/cute5.png', import.meta.url).href,
      '6': new URL('../../assets/avatar/cute6.png', import.meta.url).href,
    };
    
    if (imageError) {
      return renderPresetSvg(presetId);
    }

    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden border border-white/20 flex-shrink-0 flex items-center justify-center bg-white`}>
        <img 
          src={avatarImgs[index]} 
          alt={name} 
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  // Jika avatar adalah custom upload base64 (Galeri)
  if (saved && saved.startsWith('data:image')) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden border border-white/20 flex-shrink-0 flex items-center justify-center bg-white`}>
        <img 
          src={saved} 
          alt={name} 
          className="w-full h-full object-cover rounded-full" 
        />
      </div>
    );
  }

  // Fallback default: avatar inisial huruf nama
  return (
    <div className={`${sizes[size]} rounded-full bg-white text-[#001734] flex items-center justify-center font-bold flex-shrink-0 border-2 border-white/40 shadow-sm`}>
      {initial}
    </div>
  );
};

export default DashboardSidebar;
