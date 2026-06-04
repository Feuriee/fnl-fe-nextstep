// ============================================================
// FILE: src/components/layout/Navbar.tsx
// DESKRIPSI: Navbar utama NextStep.
//
// FITUR:
//   - Jika user BELUM login: tampilkan tombol "Masuk" / "Log In"
//   - Jika user SUDAH login: tampilkan avatar + nama user, klik → /dashboard
//   - Toggle bahasa ID/EN
//   - Mobile: hamburger menu dengan slide-down drawer
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
// Import AuthContext untuk cek status login dan data user
import { useAuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // State dropdown profil user (desktop)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { language, toggleLanguage, t } = useLanguage();
  // Ambil data user dan fungsi logout dari AuthContext
  const { user, isLoggedIn, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isUploadPage = location.pathname === '/upload';

  // Handle scroll effect untuk frosted glass navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup dropdown profil jika user klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ambil inisial nama untuk ditampilkan di avatar lingkaran
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Fungsi logout: hapus sesi, redirect ke halaman utama
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100/50 py-1'
          : 'bg-white border-b border-gray-100 py-0'
      }`}
    >
      <div className="content-container">
        <nav className="flex justify-between items-center h-16 lg:h-20 transition-all duration-300" aria-label="Main Navigation">

          {/* Logo */}
          <Link to="/" className="text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-300 text-[#001734]">
            NextStep
          </Link>

          {/* ── Desktop Menu ── */}
          <div className="hidden md:flex items-center gap-6">

            {/* Globe Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 hover:opacity-70 transition-all text-[15px] font-bold select-none cursor-pointer duration-300 text-[#001734]"
              title={language === 'en' ? 'Ubah ke Bahasa Indonesia' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <svg
                className="w-5 h-5 transition-transform duration-500 hover:rotate-45 text-[#001734]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="tracking-wide uppercase text-[15px]">{language}</span>
            </button>

            {/*
              ── Kondisi Login ──
              Jika user SUDAH login → tampilkan avatar + nama (klik untuk dropdown)
              Jika user BELUM login → tampilkan tombol "Masuk / Log In"
            */}
            {isLoggedIn && user ? (
              <div className="relative" ref={profileRef}>
                {/* Tombol Avatar + Nama User */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 group hover:bg-[#001734]/5"
                  aria-label="Buka menu profil"
                >
                  {/* Lingkaran Avatar dengan Inisial */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#001734] to-[#002C59] flex items-center justify-center text-white text-[13px] font-bold shadow-md">
                    {getInitial(user.name)}
                  </div>
                  {/* Nama User — maks 16 karakter agar tidak overflow */}
                  <span className="text-[14px] font-semibold max-w-[120px] truncate text-[#001734]">
                    {user.name}
                  </span>
                  {/* Chevron icon yang berputar saat dropdown terbuka */}
                  <svg
                    className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu Profil */}
                <div className={`absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 z-50 ${
                  isProfileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>
                  {/* Info user di atas dropdown */}
                  <div className="px-4 py-3 bg-[#F8FAFC] border-b border-gray-100">
                    <p className="text-[12px] text-[#64748B]">
                      {language === 'id' ? 'Masuk sebagai' : 'Signed in as'}
                    </p>
                    <p className="text-[13px] font-semibold text-[#001734] truncate">{user.email}</p>
                  </div>

                  {/* Menu item: Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[14px] text-[#001734] hover:bg-[#001734]/5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>

                  {/* Menu item: Keluar */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-[14px] text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {language === 'id' ? 'Keluar' : 'Log Out'}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="font-medium text-[15px] hover:opacity-70 transition-opacity text-[#001734]">
                {t.navLogin}
              </Link>
            )}

            {/* Tombol Upload CV — disembunyikan jika sudah di halaman /upload */}
            {!isUploadPage && (
              <Link
                to="/upload"
                className="bg-gradient-to-r from-[#001734] to-[#002C59] text-white px-6 py-2.5 rounded-lg font-semibold text-[14px] hover:opacity-90 transition-all shadow-md"
              >
                {t.navUploadCV}
              </Link>
            )}
          </div>

          {/* ── Mobile: Tombol Hamburger ── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl transition-all duration-300 shadow-md ${
              isMenuOpen ? 'bg-[#002C59]' : 'bg-[#001734] hover:bg-[#00224d]'
            }`}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className={`block h-[2px] w-5 rounded-full transition-all duration-300 bg-white ${isMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block h-[2px] w-5 rounded-full transition-all duration-300 mt-1.5 bg-white ${isMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-[2px] w-5 rounded-full transition-all duration-300 mt-1.5 bg-white ${isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
          </button>
        </nav>

        {/* ── Mobile Drawer ── */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="mx-1 mb-4 bg-gradient-to-br from-[#001734] to-[#002C59] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col px-5 py-5 gap-1">

              {/* Jika sudah login — tampilkan info user + link dashboard di drawer mobile */}
              {isLoggedIn && user ? (
                <>
                  {/* Info user */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-1">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-[14px] font-bold">
                      {getInitial(user.name)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-[14px] truncate max-w-[180px]">{user.name}</p>
                      <p className="text-white/60 text-[12px] truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-1" />

                  {/* Link ke Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 px-3 py-3 rounded-xl transition-all duration-200 font-semibold text-[14px] w-full"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>

                  {/* Tombol Keluar */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-300 hover:text-red-200 hover:bg-white/10 px-3 py-3 rounded-xl transition-all duration-200 font-semibold text-[14px] w-full"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {language === 'id' ? 'Keluar' : 'Log Out'}
                  </button>
                </>
              ) : (
                <>
                  {/* Language toggle — hanya tampil jika belum login */}
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 px-3 py-3 rounded-xl transition-all duration-200 font-semibold text-[14px] w-full"
                    aria-label="Toggle language"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="uppercase tracking-widest text-[13px]">{language}</span>
                  </button>

                  <div className="h-px bg-white/10 my-1" />

                  {/* Login */}
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 px-3 py-3 rounded-xl transition-all duration-200 font-semibold text-[14px] w-full"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t.navLogin}
                  </Link>
                </>
              )}

              {/* Upload CV — selalu tampil kecuali di halaman /upload */}
              {!isUploadPage && (
                <Link
                  to="/upload"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mt-1 bg-white text-[#001734] py-3 rounded-xl font-bold text-[14px] text-center shadow-md hover:bg-[#EEF3FF] transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {t.navUploadCV}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


