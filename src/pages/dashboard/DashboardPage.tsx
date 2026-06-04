// ============================================================
// FILE: src/pages/dashboard/DashboardPage.tsx
// DESKRIPSI: Halaman Dashboard utama NextStep — merakit semua komponen.
//
// STRUKTUR LAYOUT:
//   - DashboardSidebar (kiri, desktop) / Bottom Nav (mobile)
//   - Area konten utama dengan 6 TAB:
//     1. Overview  — WelcomePanel + MatchScoreGauge + SkillCloud
//     2. Jobs      — Semua JobCard (lowongan yang direkomendasikan)
//     3. Saved     — Lowongan Kerja yang Disimpan oleh User
//     4. Skill-Up  — LearnCard (rekomendasi kursus)
//     5. Trends    — MarketTrendWidget (tren pasar kerja)
//     6. Profile   — Edit Profil (Nama, Foto Avatar) + Lowongan Tersimpan
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useRequireAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';

// Import API services
import { recommendationApi, userApi, authApi, cvApi, savedJobApi } from '../../services/api';

// Import mock data & constants (digunakan sebagai fallback)
import { MOCK_AI_RESPONSE, MOCK_MARKET_TRENDS, MOCK_LEARN_RESOURCES, STORAGE_KEYS } from '../../utils/mockData';
import type { SavedJob, AIResponseData } from '../../types/dashboard';
import { convertRecommendationToMockFormat } from '../../types/dashboard';

// Import semua komponen dashboard
import DashboardSidebar, { UserAvatar } from '../../components/dashboard/DashboardSidebar';
import WelcomePanel from '../../components/dashboard/WelcomePanel';
import MatchScoreGauge from '../../components/dashboard/MatchScoreGauge';
import SkillCloud from '../../components/dashboard/SkillCloud';
import JobCard from '../../components/dashboard/JobCard';
import MarketTrendWidget from '../../components/dashboard/MarketTrendWidget';
import LearnCard from '../../components/dashboard/LearnCard';

interface PresetButtonProps {
  preset: { id: string; icon: string; name: string; bg: string };
  onSelect: (id: string) => void;
  language: string;
}

const PresetButton: React.FC<PresetButtonProps> = ({ preset, onSelect, language: _language }) => {
  const [imageError, setImageError] = useState(false);
  const index = preset.id.replace('preset', '');

  const avatarImgs: Record<string, string> = {
    '1': new URL('../../assets/avatar/cute1.png', import.meta.url).href,
    '2': new URL('../../assets/avatar/cute2.png', import.meta.url).href,
    '3': new URL('../../assets/avatar/cute3.png', import.meta.url).href,
    '4': new URL('../../assets/avatar/cute4.png', import.meta.url).href,
    '5': new URL('../../assets/avatar/cute5.png', import.meta.url).href,
    '6': new URL('../../assets/avatar/cute6.png', import.meta.url).href,
  };

  return (
    <button
      onClick={() => onSelect(preset.id)}
      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${preset.bg}`}
    >
      {imageError ? (
        <span className="text-3xl">{preset.icon}</span>
      ) : (
        <img 
          src={avatarImgs[index]} 
          alt={preset.name} 
          onError={() => setImageError(true)}
          className="w-10 h-10 object-cover rounded-full border border-black/5"
        />
      )}
      <span className="text-[10px] font-bold text-gray-500 tracking-wide uppercase">{preset.name}</span>
    </button>
  );
};

const DashboardPage = () => {
  // Hook proteksi: jika user belum login, otomatis redirect ke /login
  const { user } = useRequireAuth();
  const { updateUser, logout } = useAuthContext();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // State tab aktif yang dikontrol oleh sidebar/header
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'saved' | 'skills' | 'trends' | 'profile'>('overview');

  // ── State data AI dari backend ──────────────────────────────
  // Mulai dengan MOCK_AI_RESPONSE sebagai fallback, lalu replace dengan data nyata
  const [aiData, setAiData] = useState<AIResponseData>(MOCK_AI_RESPONSE);
  const [isLoadingRec, setIsLoadingRec] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  // State untuk lowongan yang disimpan
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  // State untuk form edit akun
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••');
  const [validationError, setValidationError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showConfirmPasswordText, setShowConfirmPasswordText] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // State untuk modal pemilihan foto profil / karakter lucu
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // State untuk modal perbesar / zoom foto profil
  const [showZoomLightbox, setShowZoomLightbox] = useState(false);

  // State untuk konfirmasi logout di halaman Profil
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // State untuk CV Upload
  const [uploadState, setUploadState] = useState<{
    isOpen: boolean;
    status: 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';
    progress: number;
    message: string;
  }>({ isOpen: false, status: 'idle', progress: 0, message: '' });

  // Ref dan state untuk mendeteksi scroll (Hide on scroll down, show on scroll up)
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      if (!target) return;

      // Ambil nilai scrollTop baik dari window maupun element container yang scroll
      let scrollTop = 0;
      if (target === document || (target as unknown) === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      } else if ('scrollTop' in target) {
        scrollTop = (target as HTMLElement).scrollTop;
      }

      // Jika scroll sangat dekat ke atas (< 15px), selalu tampilkan header
      if (scrollTop < 15) {
        setShowHeader(true);
        lastScrollTop.current = scrollTop;
        return;
      }

      // Bandingkan posisi scroll saat ini dengan sebelumnya
      if (scrollTop > lastScrollTop.current) {
        // Scroll ke bawah -> sembunyikan header
        setShowHeader(false);
      } else {
        // Scroll ke atas -> tampilkan header
        setShowHeader(true);
      }
      
      lastScrollTop.current = scrollTop;
    };

    // Menggunakan capture: true agar mendeteksi scroll pada elemen mana pun (termasuk <main>)
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  // ── Fetch rekomendasi dari API saat pertama load ─────────────
  const fetchRecommendation = useCallback(async () => {
    try {
      setIsLoadingRec(true);
      const res = await recommendationApi.getLatest();
      if (res.data?.data) {
        const converted = convertRecommendationToMockFormat(res.data.data);
        setAiData(converted);
        setHasRealData(true);
        // Update hasCv di context jika belum ter-set
        if (user && !user.hasCv) {
          updateUser({ hasCv: true, targetRole: res.data.data.suggestedField });
        }
      }
    } catch {
      // Jika belum ada rekomendasi (404) atau error, gunakan mock data
      setHasRealData(false);
    } finally {
      setIsLoadingRec(false);
    }
  }, [user, updateUser]);

  // Load saved jobs dari backend
  const loadSavedJobs = async () => {
    try {
      const res = await savedJobApi.getAll();
      if (res.data?.data) {
        setSavedJobs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    }
  };

  // Sync data ketika user login/session berubah
  useEffect(() => {
    if (user) {
      setNewName(user.name);
      setNewEmail(user.email);
      fetchRecommendation();
    }
    loadSavedJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load ulang ketika tab berubah
  useEffect(() => {
    loadSavedJobs();
  }, [activeTab]);

  // Handle pilih preset lucu (1-6)
  const handleSelectPreset = (presetId: string) => {
    localStorage.setItem('nextstep_avatar', presetId);
    if (user) {
      updateUser({ ...user }); // trigger re-render
    }
    setShowAvatarModal(false);
  };

  // Handle upload foto dari galeri (Pilihan 7)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem('nextstep_avatar', base64String);
        if (user) {
          updateUser({ ...user }); // trigger re-render
        }
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload CV nyata
  const handleCVUpload = async (file: File) => {
    setUploadState({
      isOpen: true,
      status: 'uploading',
      progress: 10,
      message: language === 'id' ? 'Mengunggah CV Anda...' : 'Uploading your CV...'
    });

    try {
      const res = await cvApi.upload(file);
      const cvId = res.data.data.cvId;

      setUploadState(prev => ({
        ...prev,
        status: 'analyzing',
        progress: 30,
        message: language === 'id' ? 'AI sedang menganalisis (estimasi 1-2 menit)...' : 'AI is analyzing (est. 1-2 mins)...'
      }));

      const intervalId = setInterval(async () => {
        try {
          const statusRes = await cvApi.getStatus(cvId);
          const { status, error } = statusRes.data.data;

          if (status === 'analyzed') {
            clearInterval(intervalId);
            setUploadState(prev => ({
              ...prev,
              status: 'success',
              progress: 100,
              message: language === 'id' ? 'Analisis Selesai!' : 'Analysis Complete!'
            }));

            // Refresh user & recommendations
            const userRes = await authApi.getMe();
            updateUser(userRes.data.data);
            await fetchRecommendation();

            setTimeout(() => {
              setUploadState(prev => ({ ...prev, isOpen: false }));
            }, 3000);
          } else if (status === 'failed') {
            clearInterval(intervalId);
            setUploadState(prev => ({
              ...prev,
              status: 'error',
              message: error || (language === 'id' ? 'Gagal menganalisis CV.' : 'Failed to analyze CV.')
            }));
          } else {
            // Still processing
            setUploadState(prev => ({
              ...prev,
              progress: Math.min(prev.progress + 5, 90) // stop mock progress at 90
            }));
          }
        } catch (err) {
          clearInterval(intervalId);
          setUploadState(prev => ({
            ...prev,
            status: 'error',
            message: language === 'id' ? 'Terjadi kesalahan cek status.' : 'Error checking status.'
          }));
        }
      }, 5000); // Polling every 5 seconds
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        message: errorMsg || (language === 'id' ? 'Gagal mengunggah CV.' : 'Failed to upload CV.')
      }));
    }
  };

  // Handle simpan perubahan akun (ganti nama & password via API)
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user) return;

    // Validasi kecocokan password jika password diubah dari default
    if (password !== '••••••••') {
      if (password !== confirmPassword) {
        setValidationError(
          language === 'id' ? 'Konfirmasi kata sandi tidak cocok!' : 'Password confirmation does not match!'
        );
        return;
      }
      if (password.length < 8) {
        setValidationError(
          language === 'id' ? 'Kata sandi minimal harus 8 karakter!' : 'Password must be at least 8 characters!'
        );
        return;
      }
    }

    setValidationError('');

    try {
      // Update nama via API
      if (newName.trim() !== user.name) {
        await userApi.updateProfile({ name: newName.trim() });
      }

      // Update password via API jika diubah
      if (password !== '••••••••') {
        await authApi.updatePassword(confirmPassword, password);
        // Reset field password setelah berhasil
        setPassword('••••••••');
        setConfirmPassword('••••••••');
      }

      // Update data di context & sessionStorage
      updateUser({ name: newName.trim() });

      setShowPasswordText(false);
      setShowConfirmPasswordText(false);
      setToastMessage(language === 'id' ? 'Profil berhasil diperbarui!' : 'Profile updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'id' ? 'Gagal menyimpan perubahan.' : 'Failed to save changes.');
      setValidationError(msg);
    }
  };

  // Handle konfirmasi logout
  const handleLogoutConfirmed = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  // Hitung rata-rata skor kecocokan dari semua lowongan yang direkomendasikan
  const avgMatchScore = aiData.top_loker.length > 0
    ? Math.round(aiData.top_loker.reduce((sum, j) => sum + j.skor_match, 0) / aiData.top_loker.length)
    : 0;

  // Jika user belum login, tampilkan loading sementara
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#001734] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#001734] font-medium text-sm">
            {language === 'id' ? 'Memuat dashboard...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative">

      {/* ── Sidebar Navigasi (desktop kiri / mobile bottom) ── */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        language={language}
      />

      {/* Toast Notifikasi Sukses */}
      {showToast && (
        <div className="fixed top-5 right-5 z-[200] bg-[#001734] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
          <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[13px] font-semibold">
            {toastMessage || (language === 'id' ? 'Profil berhasil diperbarui!' : 'Profile updated successfully!')}
          </span>
        </div>
      )}

      {/* ── Area Konten Utama (lg:pl-[260px] agar tidak tertampal sidebar desktop) ── */}
      <main className="flex-1 min-w-0 pb-24 lg:pb-8 lg:pl-[260px] overflow-auto">

        {/* ════ FLOATING DYNAMIC ISLAND HEADER (SCROLL CONTROLLED) ════ */}
        <div className={`fixed left-3 right-3 lg:left-[276px] lg:right-4 z-10 bg-[#001734]/95 backdrop-blur-md px-4 sm:px-6 h-[64px] rounded-2xl flex items-center justify-between shadow-lg border border-white/5 transition-all duration-300 ${
          showHeader 
            ? 'top-3 opacity-100' 
            : '-top-20 opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center">
              {/* Judul tab yang sedang aktif */}
              <h2 className="text-[17px] sm:text-[18px] font-bold text-white leading-none">
                {activeTab === 'overview' && (language === 'id' ? 'Ringkasan Karier' : 'Career Overview')}
                {activeTab === 'jobs'     && (language === 'id' ? 'Lowongan Direkomendasikan' : 'Recommended Jobs')}
                {activeTab === 'saved'    && (language === 'id' ? 'Lowongan Tersimpan' : 'Saved Jobs')}
                {activeTab === 'skills'   && 'Skill-Up Hub'}
                {activeTab === 'trends'   && (language === 'id' ? 'Tren Pasar Kerja' : 'Job Market Trends')}
                {activeTab === 'profile'  && (language === 'id' ? 'Profil Saya' : 'My Profile')}
              </h2>
              {/* Breadcrumb singkat */}
              <p className="text-white/40 text-[9px] sm:text-[10px] mt-1.5 uppercase tracking-[0.15em] leading-none">
                NextStep / {activeTab === 'overview' && (language === 'id' ? 'Ringkasan' : 'Overview')}
                {activeTab === 'jobs'     && (language === 'id' ? 'Lowongan' : 'Jobs')}
                {activeTab === 'saved'    && (language === 'id' ? 'Tersimpan' : 'Saved')}
                {activeTab === 'skills'   && 'Skills'}
                {activeTab === 'trends'   && (language === 'id' ? 'Tren' : 'Trends')}
                {activeTab === 'profile'  && (language === 'id' ? 'Profil' : 'Profile')}
              </p>
            </div>

            {/* Quick stats mini di header + Tombol Save Jobs di Atas Nav */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* 💾 Tombol Lowongan Tersimpan (Save Jobs) Melayang di Atas Nav */}
              <button
                onClick={() => setActiveTab('saved')}
                className={`relative p-2 rounded-xl border transition-all duration-200 shrink-0 ${
                  activeTab === 'saved'
                    ? 'bg-white text-[#001734] border-white shadow-md'
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
                }`}
                title={language === 'id' ? 'Lowongan Tersimpan' : 'Saved Jobs'}
              >
                {/* Bookmark SVG Icon */}
                <svg className={`w-4.5 h-4.5 transition-all ${activeTab === 'saved' ? 'fill-white text-white' : 'text-white fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {/* Counter Badge */}
                {savedJobs.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border-2 border-[#001734] shadow-sm">
                    {savedJobs.length}
                  </span>
                )}
              </button>

              <div className="hidden sm:block h-6 w-px bg-white/15 shrink-0" />

              <div className="hidden sm:block text-right shrink-0">
                <p className="text-[10px] text-white/50">{language === 'id' ? 'Lowongan Cocok' : 'Matched Jobs'}</p>
                <p className="text-[13px] font-bold text-white">{aiData.top_loker.length}</p>
              </div>
              
              <div className="hidden sm:block h-6 w-px bg-white/15 shrink-0" />
              
              <div className="hidden sm:block text-right shrink-0">
                <p className="text-[10px] text-white/50">{language === 'id' ? 'Avg. Match' : 'Avg. Match'}</p>
                <p className="text-[13px] font-bold text-white">{avgMatchScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Konten Per Tab (pt-[96px] memberi jarak pas dari h-64px floating header) ── */}
        <div className="px-5 lg:px-8 pt-[96px] pb-6 space-y-6">

          {/* ════ TAB 1: OVERVIEW ════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">

              {/* Banner status data (loading atau mock) */}
              {isLoadingRec && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="text-[12px] text-blue-700 font-medium">
                    {language === 'id' ? 'Memuat rekomendasi terbaru...' : 'Loading latest recommendations...'}
                  </p>
                </div>
              )}


              {/* Panel selamat datang + status CV */}
              <WelcomePanel
                user={user}
                recommendedField={aiData.rekomendasi_utama_bidang}
                language={language}
                onAvatarClick={() => setShowZoomLightbox(true)}
                onUpload={handleCVUpload}
              />

              {/* Grid 2 kolom: Skor + Skill */}
              {hasRealData && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Skor kecocokan */}
                  <MatchScoreGauge score={avgMatchScore} language={language} />

                  {/* Skill cloud */}
                  <SkillCloud
                    skills={aiData.data_pelamar?.skill_terdeteksi || []}
                    language={language}
                  />
                </div>
              )}

              {/* Pratinjau 3 lowongan teratas */}
              {hasRealData && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      {/* Medal/Trophy SVG Icon */}
                      <svg className="w-4.5 h-4.5 text-[#001734] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33a1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 005 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51H15a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                      </svg>
                      <h3 className="text-[15px] font-bold text-[#001734]">
                        {language === 'id' ? 'Top 3 Lowongan Untukmu' : 'Top 3 Jobs For You'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="text-[13px] text-[#001734] font-semibold hover:text-[#002C59] transition-colors"
                    >
                      {language === 'id' ? 'Lihat Semua →' : 'View All →'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {aiData.top_loker?.slice(0, 3).map((job, i) => (
                      <JobCard 
                        key={`${job.posisi}-${job.perusahaan}`} 
                        job={job} 
                        index={i} 
                        language={language}
                        onSaveToggle={loadSavedJobs}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TAB 2: SEMUA LOWONGAN ════ */}
          {activeTab === 'jobs' && (
            <div className="animate-fade-in">
              {hasRealData ? (
                <>
                  {/* Deskripsi singkat */}
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <div className="text-blue-500 shrink-0 mt-0.5">
                      {/* Briefcase SVG */}
                      <svg className="w-5 h-5 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#001734]">
                        {language === 'id'
                          ? `${aiData.top_loker?.length || 0} lowongan direkomendasikan berdasarkan CV kamu`
                          : `${aiData.top_loker?.length || 0} jobs recommended based on your CV`}
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
                        {language === 'id'
                          ? 'Diurutkan berdasarkan tingkat kecocokan tertinggi'
                          : 'Sorted by highest match score'}
                      </p>
                    </div>
                  </div>

                  {/* Semua kartu lowongan */}
                  <div className="space-y-4">
                    {aiData.top_loker?.map((job, i) => (
                      <JobCard 
                        key={`${job.posisi}-${job.perusahaan}`} 
                        job={job} 
                        index={i} 
                        language={language}
                        onSaveToggle={loadSavedJobs}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-gray-150 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F4FA] border border-[#001734]/15 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#001734]">
                    {language === 'id' ? 'Belum Ada Lowongan' : 'No Jobs Available'}
                  </h4>
                  <p className="text-[12px] text-gray-500 mt-1.5 max-w-sm font-medium leading-relaxed">
                    {language === 'id' 
                      ? 'Silakan unggah CV Anda terlebih dahulu untuk mendapatkan rekomendasi lowongan pekerjaan dari AI.' 
                      : 'Please upload your CV first to get AI-powered job recommendations.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#001734] text-white text-[13px] font-bold hover:bg-[#002C59] transition-all shadow-md active:scale-95"
                  >
                    {language === 'id' ? 'Unggah CV Sekarang' : 'Upload CV Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════ TAB 3: LOWONGAN TERSIMPAN ════ */}
          {activeTab === 'saved' && (
            <div className="animate-fade-in">
              {savedJobs.length === 0 ? (
                /* Empty state premium */
                <div className="bg-white rounded-2xl p-8 border border-gray-150 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F4FA] border border-[#001734]/15 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#001734]">
                    {language === 'id' ? 'Belum Ada Lowongan Tersimpan' : 'No Saved Jobs Yet'}
                  </h4>
                  <p className="text-[12px] text-gray-500 mt-1.5 max-w-sm font-medium leading-relaxed">
                    {language === 'id' 
                      ? 'Cari lowongan pekerjaan yang direkomendasikan AI untuk Anda dan simpan di sini.' 
                      : 'Explore AI-recommended job openings and save them here for quick access.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#001734] text-white text-[13px] font-bold hover:bg-[#002C59] transition-all shadow-md active:scale-95"
                  >
                    {language === 'id' ? 'Cari Lowongan Sekarang' : 'Find Jobs Now'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((job, i) => (
                    <JobCard
                      key={`${job.posisi}-${job.perusahaan}`}
                      job={job}
                      index={i}
                      language={language}
                      onSaveToggle={loadSavedJobs}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ TAB 4: SKILL-UP HUB ════ */}
          {activeTab === 'skills' && (
            <div className="animate-fade-in">
              {/* Header informasi */}
              <div className="bg-[#F0F4FA] border border-[#001734]/10 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <div className="text-[#001734] shrink-0 mt-0.5">
                  {/* Rocket SVG */}
                  <svg className="w-5 h-5 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#001734]">
                    {language === 'id' ? 'Rekomendasi Kursus Berbasis Skill Gap' : 'Skill Gap-Based Course Recommendations'}
                  </p>
                  <p className="text-[12px] text-[#001734]/70 mt-0.5 font-medium">
                    {language === 'id'
                      ? 'Kursus dipilih berdasarkan skill yang dibutuhkan di lowongan pekerjaan kamu'
                      : 'Courses selected based on skills required in your recommended jobs'}
                  </p>
                </div>
              </div>

              {hasRealData ? (
                <>
                  {/* Grid 2 kolom kursus */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const skillsMap = new Map<string, string | null>();
                      if (aiData?.top_loker) {
                        aiData.top_loker.forEach(job => {
                          if (job.saran_belajar) {
                            job.saran_belajar.forEach((skill, idx) => {
                              if (!skillsMap.has(skill)) {
                                skillsMap.set(skill, (job.link_belajar && job.link_belajar[idx]) ? job.link_belajar[idx] : null);
                              }
                            });
                          }
                        });
                      }
                      
                      const dynamicResources = Array.from(skillsMap.entries()).slice(0, 6).map(([skill, link], index) => {
                        let platformStr = ['Coursera', 'Udemy', 'LinkedIn Learning', 'edX', 'Pluralsight', 'Skillshare'][index % 6];
                        if (link) {
                          if (link.includes('coursera')) platformStr = 'Coursera';
                          else if (link.includes('udemy')) platformStr = 'Udemy';
                          else if (link.includes('linkedin')) platformStr = 'LinkedIn Learning';
                          else if (link.includes('edx')) platformStr = 'edX';
                          else {
                            try {
                              const urlObj = new URL(link);
                              platformStr = urlObj.hostname.replace('www.', '');
                            } catch (e) {
                              // abaikan jika URL invalid
                            }
                          }
                        }

                        return {
                          id: index + 1,
                          judul: `Mastering ${skill}`,
                          platform: platformStr,
                          skill_target: skill,
                          durasi: `${Math.floor(Math.random() * 4) + 2} Weeks`,
                          rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
                          url: link || `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`
                        };
                      });

                      // Fallback if no skills are recommended
                      const resourcesToDisplay = dynamicResources.length > 0 ? dynamicResources : MOCK_LEARN_RESOURCES;

                      return resourcesToDisplay.map((resource, i) => (
                        <LearnCard key={resource.id} resource={resource} index={i} language={language} />
                      ));
                    })()}
                  </div>

                  {/* Skill cloud di bawah — reminder skill yang perlu dikuasai */}
                  <div className="mt-6">
                    <SkillCloud
                      skills={aiData.data_pelamar?.skill_terdeteksi || []}
                      language={language}
                    />
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-gray-150 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F4FA] border border-[#001734]/15 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#001734]">
                    {language === 'id' ? 'Belum Ada Rekomendasi' : 'No Recommendations Yet'}
                  </h4>
                  <p className="text-[12px] text-gray-500 mt-1.5 max-w-sm font-medium leading-relaxed">
                    {language === 'id' 
                      ? 'Silakan unggah CV Anda terlebih dahulu untuk mendapatkan rekomendasi kursus dari AI.' 
                      : 'Please upload your CV first to get AI-powered course recommendations.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#001734] text-white text-[13px] font-bold hover:bg-[#002C59] transition-all shadow-md active:scale-95"
                  >
                    {language === 'id' ? 'Unggah CV Sekarang' : 'Upload CV Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════ TAB 5: TREN PASAR KERJA ════ */}
          {activeTab === 'trends' && (
            <div className="animate-fade-in space-y-6">
              {/* Penjelasan data tren */}
              <div className="bg-[#F0F4FA] border border-[#001734]/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="text-[#001734] shrink-0 mt-0.5">
                  {/* Chart SVG */}
                  <svg className="w-5 h-5 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#001734]">
                    {language === 'id' ? 'Data Tren Pasar Kerja Indonesia 2026' : 'Indonesia Job Market Trend Data 2026'}
                  </p>
                  <p className="text-[12px] text-[#001734]/70 mt-0.5 font-medium">
                    {language === 'id'
                      ? 'Menampilkan tingkat permintaan skill di industri teknologi'
                      : 'Showing skill demand level in the technology industry'}
                  </p>
                </div>
              </div>

              {/* Widget tren pasar */}
              <MarketTrendWidget trends={MOCK_MARKET_TRENDS} language={language} />
            </div>
          )}

          {/* ════ TAB 6: PROFIL SAYA ════ */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in space-y-6">

              {/* Grid Profil: Uploader Foto / Preset Picker + Form Akun Lengkap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Bagian Kiri: Tampilan Profil & Tombol Ubah (Tanpa background kotak radius) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center md:col-span-1">
                  
                  {/* Avatar Besar Interaktif (Tanpa wrapper kotak radius) */}
                  <div className="relative group mb-4 rounded-full overflow-hidden transition-transform hover:scale-105">
                    <UserAvatar name={user.name} size="lg" />
                    {/* Hover Overlay dengan Dua Aksi Ganda (Zoom & Ganti) */}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {/* Tombol Perbesar / Zoom */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowZoomLightbox(true);
                        }}
                        className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
                        title={language === 'id' ? 'Perbesar Foto' : 'Zoom Photo'}
                      >
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </button>

                      {/* Tombol Ganti Preset */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAvatarModal(true);
                        }}
                        className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
                        title={language === 'id' ? 'Ganti Foto' : 'Change Photo'}
                      >
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-[16px] text-[#001734]">{user.name}</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>

                  {/* Tombol Ganti Foto */}
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="mt-4 px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                  >
                    {language === 'id' ? 'Ubah Foto Profil' : 'Change Profile Pic'}
                  </button>
                </div>

                {/* Bagian Kanan: Tempat Edit Akun (Ganti Email, Nama, Password) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2">
                  <h3 className="font-bold text-[14px] text-[#001734] mb-4">
                    {language === 'id' ? 'Edit Akun Saya' : 'Edit My Account'}
                  </h3>

                  <form onSubmit={handleSaveAccount} className="space-y-4">
                    
                    {/* Input Nama Lengkap */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#001734] focus:outline-none focus:border-[#001734] transition-all"
                        placeholder={language === 'id' ? 'Masukkan nama lengkap' : 'Enter full name'}
                        required
                      />
                    </div>

                    {/* Input Email */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        {language === 'id' ? 'Alamat Email' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#001734] focus:outline-none focus:border-[#001734] transition-all"
                        placeholder="name@company.com"
                        required
                      />
                    </div>

                    {/* Input Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                          {language === 'id' ? 'Kata Sandi / Password Baru' : 'New Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswordText ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setValidationError('');
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-11 py-2.5 text-[13px] font-medium text-[#001734] focus:outline-none focus:border-[#001734] transition-all"
                            placeholder={language === 'id' ? 'Masukkan password baru' : 'Enter new password'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordText(!showPasswordText)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                          >
                            {showPasswordText ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                          {language === 'id' ? 'Konfirmasi Kata Sandi Baru' : 'Confirm New Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPasswordText ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setValidationError('');
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-11 py-2.5 text-[13px] font-medium text-[#001734] focus:outline-none focus:border-[#001734] transition-all"
                            placeholder={language === 'id' ? 'Ulangi password baru' : 'Repeat new password'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPasswordText(!showConfirmPasswordText)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                          >
                            {showConfirmPasswordText ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {validationError && (
                      <p className="text-[11px] font-semibold text-red-500 mt-1">
                        {validationError}
                      </p>
                    )}

                    {/* Tombol Simpan */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#001734] text-white text-[13px] font-bold hover:bg-[#002C59] transition-all shadow-sm active:scale-95"
                      >
                        {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Bagian Bawah: Tempat Save Lowongan (Profile Integration) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    {/* Bookmark SVG */}
                    <svg className="w-4.5 h-4.5 text-[#001734] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <h3 className="text-[15px] font-bold text-[#001734]">
                      {language === 'id' ? 'Lowongan Tersimpan Saya' : 'My Saved Jobs'}
                    </h3>
                  </div>
                  {savedJobs.length > 0 && (
                    <button
                      onClick={() => setActiveTab('saved')}
                      className="text-[13px] text-[#001734] font-semibold hover:text-[#002C59] transition-colors"
                    >
                      {language === 'id' ? 'Lihat Semua →' : 'View All →'}
                    </button>
                  )}
                </div>

                {savedJobs.length === 0 ? (
                  /* Empty state mini */
                  <div className="bg-white rounded-2xl p-6 border border-gray-150 flex flex-col items-center justify-center text-center">
                    <p className="text-[12px] text-gray-400 font-semibold">
                      {language === 'id' ? 'Belum ada lowongan tersimpan.' : 'No saved jobs.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="text-[12px] text-[#001734] font-bold mt-2 hover:underline"
                    >
                      {language === 'id' ? 'Cari rekomendasi lowongan sekarang →' : 'Search recommended jobs now →'}
                    </button>
                  </div>
                ) : (
                  /* Render 3 lowongan tersimpan teratas */
                  <div className="space-y-4">
                    {savedJobs.slice(0, 3).map((job, i) => (
                      <JobCard
                        key={`${job.posisi}-${job.perusahaan}`}
                        job={job}
                        index={i}
                        language={language}
                        onSaveToggle={loadSavedJobs}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>{/* end konten */}
      </main>

      {/* ════ MODAL PILIH AVATAR (6 Presets + 7th Galeri) ════ */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAvatarModal(false)}
          />
          {/* Box Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in overflow-hidden border border-gray-100">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[15px] font-bold text-[#001734]">
                {language === 'id' ? 'Pilih Karakter Lucu' : 'Choose Cute Avatar'}
              </h3>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grid 6 pilihan preset karakter lucu */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { id: 'preset1', icon: '💻', name: language === 'id' ? 'IT / Teknologi' : 'IT / Tech', bg: 'bg-gray-50 border-gray-150 text-slate-700 hover:bg-gray-100 hover:border-gray-300' },
                { id: 'preset2', icon: '🩺', name: language === 'id' ? 'Kesehatan' : 'Healthcare', bg: 'bg-gray-50 border-gray-150 text-slate-700 hover:bg-gray-100 hover:border-gray-300' },
                { id: 'preset3', icon: '👩‍🏫', name: language === 'id' ? 'Pendidikan' : 'Education', bg: 'bg-gray-50 border-gray-150 text-slate-700 hover:bg-gray-100 hover:border-gray-300' },
                { id: 'preset4', icon: '💼', name: language === 'id' ? 'Keuangan' : 'Finance', bg: 'bg-gray-50 border-gray-150 text-slate-700 hover:bg-gray-100 hover:border-gray-300' },
                { id: 'preset5', icon: '⚖️', name: language === 'id' ? 'Hukum' : 'Law / Legal', bg: 'bg-gray-50 border-gray-150 text-slate-700 hover:bg-gray-100 hover:border-gray-300' },
                { id: 'preset6', icon: '🏛️', name: language === 'id' ? 'Pemerintahan' : 'Government', bg: 'bg-gray-50 border-gray-150 text-slate-700 hover:bg-gray-100 hover:border-gray-300' },
              ].map((preset) => (
                <PresetButton
                  key={preset.id}
                  preset={preset}
                  onSelect={handleSelectPreset}
                  language={language}
                />
              ))}
            </div>

            {/* Opsi Upload Foto Sendiri (Tanpa Numbering) */}
            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-left">
                  <p className="text-[12px] font-bold text-gray-700">
                    {language === 'id' ? 'Unggah Foto Sendiri' : 'Upload Your Own Photo'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {language === 'id' ? 'Pilih file gambar dari galeri perangkat Anda' : 'Choose an image file from your device gallery'}
                  </p>
                </div>
              </label>
            </div>

          </div>
        </div>
      )}

      {/* ════ MODAL KONFIRMASI LOGOUT HALAMAN PROFIL ════ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in border border-gray-150">
            {/* Ikon peringatan */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF3FF] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
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

      {/* ════ MODAL ZOOM AVATAR (LIGHTBOX) ════ */}
      {showZoomLightbox && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setShowZoomLightbox(false)}
          />
          {/* Box Dialog dengan Animasi Scale-Up */}
          <div className="relative max-w-sm w-full bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-3xl flex flex-col items-center justify-center animate-scale-up shadow-2xl z-10">
            {/* Close button */}
            <button 
              onClick={() => setShowZoomLightbox(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 z-20 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Main large avatar */}
            <div className="w-64 h-64 rounded-full overflow-hidden border-2 border-white/25 shadow-xl bg-white flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full">
                <UserAvatar name={user.name} size="xl" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ════ MODAL UPLOAD CV ════ */}
      {uploadState.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-scale-up border border-gray-150">
            <h3 className="text-xl font-bold text-[#001734] mb-6 text-center">
              {language === 'id' ? 'Memproses CV Anda' : 'Processing Your CV'}
            </h3>

            {uploadState.status === 'error' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 text-center font-medium mb-6">{uploadState.message}</p>
                <button
                  onClick={() => setUploadState(prev => ({ ...prev, isOpen: false }))}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  {language === 'id' ? 'Tutup' : 'Close'}
                </button>
              </div>
            ) : uploadState.status === 'success' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-600 text-center font-medium">{uploadState.message}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Circular Progress */}
                <div className="relative w-24 h-24 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#EEF2F7" strokeWidth="8" />
                    <circle
                      cx="48" cy="48" r="40" fill="none"
                      stroke="#001734" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - uploadState.progress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold text-[#001734]">
                    {uploadState.progress}%
                  </span>
                </div>
                <p className="text-[#001734] font-semibold text-center animate-pulse">
                  {uploadState.message}
                </p>
                {uploadState.status === 'analyzing' && (
                  <p className="text-gray-500 text-xs mt-3 text-center">
                    {language === 'id'
                      ? 'Mohon jangan tutup halaman ini.'
                      : 'Please do not close this page.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
