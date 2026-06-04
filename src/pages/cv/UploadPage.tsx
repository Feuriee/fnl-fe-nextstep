import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthContext } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import ShapeGrid from '../../components/common/ShapeGrid';
import { cvApi } from '../../services/api';

// ─── Type Definitions ───────────────────────────────────────────────────────

interface JobRecommendation {
  posisi: string;
  perusahaan: string;
  industri: string;
  skor_match: number;
  saran_belajar: string[];
  link_lamaran?: string;
  link_belajar?: string[];
}

interface AIResponseData {
  status: string;
  data_pelamar: {
    skill_terdeteksi: string[];
  };
  rekomendasi_utama_bidang: string;
  top_3_loker: JobRecommendation[];
}

// ─── Translations ─────────────────────────────────────────────────────────────

const t_map = {
  en: {
    title: 'CV Analysis Simulation',
    subtitle: 'Try uploading your CV without logging in to see how our system works!',
    dragDropText: 'Drag & drop your CV here, or click to browse',
    supportText: 'Supports PDF, DOCX, or TXT · Max 5 MB',
    analyzing: 'Analyzing CV structure…',
    mapping: 'Mapping skills against 2026 market demand…',
    done: 'Analysis Complete',
    dashboardTitle: 'Your CV Analysis Simulation Dashboard',
    fileLabel: 'Document',
    skillsFound: 'Skills Detected',
    moreSkillsLocked: 'more skills locked',
    recommendedDomain: 'Top Career Field',
    topJobs: 'Recommended Positions',
    matchScore: 'Match',
    skillGapTitle: 'Skill Roadmap',
    skillGapSubtitle: 'Learn these to hit 100% match for this role:',
    ctaTitle: 'Unlock your full career report',
    ctaDesc: 'Unlock other features and 2 locked jobs — just log in and create a FREE account!',
    ctaButton: 'Log In / Register — Free',
    uploadBtn: 'Upload Another CV',
    jobLockedTitle: 'Position Locked',
    jobLockedDesc: 'Sign in or create a free account to reveal this role and its personalised roadmap.',
    loginLink: 'Log In or Register →',
  },
  id: {
    title: 'Simulasi Analisis CV',
    subtitle: 'Coba Simulasi Upload CV Anda tanpa login untuk melihat bagaimana sistem kami bekerja!',
    dragDropText: 'Tarik & letakkan CV Anda di sini, atau klik untuk memilih',
    supportText: 'Mendukung PDF, DOCX, atau TXT · Maks. 5 MB',
    analyzing: 'Menganalisis struktur CV…',
    mapping: 'Memetakan keahlian ke tren pasar 2026…',
    done: 'Analisis Selesai',
    dashboardTitle: 'Dashboard simulasi Analisis CV Anda',
    fileLabel: 'Dokumen',
    skillsFound: 'Keahlian Terdeteksi',
    moreSkillsLocked: 'keahlian lainnya dikunci',
    recommendedDomain: 'Bidang Karier Utama',
    topJobs: 'Rekomendasi Lowongan',
    matchScore: 'Cocok',
    skillGapTitle: 'Roadmap Skill',
    skillGapSubtitle: 'Pelajari ini untuk mencapai 100% kecocokan posisi ini:',
    ctaTitle: 'Buka laporan karier lengkap Anda',
    ctaDesc: 'Untuk membuka fitur lain nya dan buka 2 lowongan terkunci cukup login dan buat akun GRATIS!',
    ctaButton: 'Masuk / Daftar Gratis!',
    uploadBtn: 'Unggah CV Lain',
    jobLockedTitle: 'Posisi Dikunci',
    jobLockedDesc: 'Masuk atau buat akun gratis untuk membuka posisi ini dan roadmap personalnya.',
    loginLink: 'Masuk atau Daftar →',
  },
};

// ─── Skill tag color palette (cycles through navy shades) ────────────────────

const SKILL_COLORS = [
  { bg: '#E8EDF2', text: '#001734', border: 'transparent' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const UploadPage = () => {
  const { language } = useLanguage();
  const { user } = useAuthContext();
  const t = t_map[language];

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [loadStep, setLoadStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // State diisi dengan hasil nyata dari AI API (bukan mock statis)
  const [aiData, setAiData] = useState<AIResponseData | null>(null);

  // Jika user login, semua skill terlihat. Jika tidak, hanya 4.
  const visibleSkills = user 
    ? (aiData?.data_pelamar.skill_terdeteksi ?? [])
    : (aiData?.data_pelamar.skill_terdeteksi.slice(0, 4) ?? []);
  const lockedSkillsCount = (aiData?.data_pelamar.skill_terdeteksi.length ?? 0) - visibleSkills.length;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startAnalysis(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      startAnalysis(e.dataTransfer.files[0]);
    }
  };

  /**
   * startAnalysis — Kirim CV ke backend → backend kirim ke AI → tampilkan hasil.
   *
   * Alur:
   *   1. Set loading state + mulai animasi progress palsu (0% → 85%)
   *   2. POST file ke /api/v1/cv/analyze-public
   *   3. Saat respons diterima → isi aiData → set progress 100% → status 'success'
   *   4. Jika error → set status 'error' + tampilkan pesan
   */
  const startAnalysis = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('loading');
    setProgress(0);
    setErrorMsg('');
    setLoadStep(t.analyzing);

    // Animasi progress palsu (0% → 85%) selama menunggu API
    // Sengaja lambat agar tidak mencapai 100% sebelum API selesai
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setProgress(current);
      if (current === 30) setLoadStep(t.mapping);
      if (current >= 85) clearInterval(interval); // Berhenti di 85%, tunggu API
    }, 150); // ~13 detik untuk mencapai 85%

    try {
      const res = await cvApi.analyzePublic(selectedFile);
      const result = res.data.data;

      clearInterval(interval);
      setAiData(result);
      setProgress(100);
      setLoadStep(t.done);
      setStatus('success');
    } catch (err: unknown) {
      clearInterval(interval);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'id'
          ? 'Gagal menganalisis CV. Coba lagi.'
          : 'Failed to analyze CV. Please try again.');
      setErrorMsg(msg);
      setStatus('error');
      setProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setLoadStep('');
    setErrorMsg('');
    setAiData(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between">
      {/* ── ShapeGrid: subtle light grid on white background ─────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.6]">
        <ShapeGrid
          speed={0.3}
          squareSize={44}
          direction="diagonal"
          borderColor="#dde3ea"
          hoverFillColor="#edf0f3"
          shape="square"
          hoverTrailAmount={0}
        />
      </div>

      {/* ── Page Content (above the canvas) ─────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow flex items-start py-16 anim-page-enter">
          <div className="content-container w-full max-w-5xl">

            {/* ── Upload / Loading / Error State ────────────────────────── */}
            {status !== 'success' && (
              <section aria-label={t.title} className="flex flex-col items-center">
                <header className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-[#001734] mb-3 tracking-tight">
                    {t.title}
                  </h1>
                  <p className="text-[#2C3E50] text-[15px] max-w-[600px] mx-auto leading-relaxed font-medium">
                    {t.subtitle}
                  </p>
                </header>

              <div className="w-full max-w-2xl">
                {/* Drop Zone */}
                {(status === 'idle' || status === 'error') && (
                  <>
                    {/* Error Banner */}
                    {status === 'error' && (
                      <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                          <p className="text-[13px] font-bold text-red-700">
                            {language === 'id' ? 'Analisis Gagal' : 'Analysis Failed'}
                          </p>
                          <p className="text-[12px] text-red-600 mt-0.5">{errorMsg}</p>
                        </div>
                      </div>
                    )}
                    <label
                      htmlFor="cv-upload-input"
                      className="group flex flex-col items-center justify-center w-full border-2 border-dashed border-[#001734]/20 hover:border-[#001734]/50 rounded-3xl p-12 cursor-pointer bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {/* Upload icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-[#001734] to-[#003066] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="text-[16px] font-bold text-[#001734] mb-2 text-center">
                        {t.dragDropText}
                      </span>
                      <span className="text-[13px] text-[#8A9AB0]">{t.supportText}</span>
                      <input
                        id="cv-upload-input"
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                )}

                {/* Loading State */}
                {status === 'loading' && (
                  <div className="bg-white rounded-3xl p-12 flex flex-col items-center shadow-sm border border-gray-100">
                    {/* Circular progress */}
                    <div className="relative w-24 h-24 mb-6">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#EEF2F7" strokeWidth="8" />
                        <circle
                          cx="48" cy="48" r="40" fill="none"
                          stroke="#001734" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                          style={{ transition: 'stroke-dashoffset 0.15s ease' }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold text-[#001734]">
                        {progress}%
                      </span>
                    </div>
                    <p className="text-[16px] font-bold text-[#001734] mb-1 text-center animate-pulse">
                      {loadStep}
                    </p>
                    {file && (
                      <p className="text-[13px] text-[#8A9AB0] truncate max-w-[280px]">{file.name}</p>
                    )}
                    <p className="text-[11px] text-[#8A9AB0] mt-4 text-center">
                      {language === 'id'
                        ? '⏳ AI sedang menganalisis CV Anda. Harap tunggu hingga 2 menit.'
                        : '⏳ AI is analyzing your CV. Please wait up to 2 minutes.'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Success / Dashboard State ──────────────────────────────────── */}
          {status === 'success' && aiData && (
            <section aria-label={t.dashboardTitle} className="space-y-8 anim-page-enter">
              {/* Info: data ini dari AI nyata */}
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[12px] font-semibold text-emerald-700">
                  {language === 'id'
                    ? '✨ Hasil ini dihasilkan oleh AI kami secara real-time berdasarkan CV Anda.'
                    : '✨ This result was generated in real-time by our AI based on your CV.'}
                </p>
              </div>

              {/* Dashboard Header */}
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E2EAF4]">
                <div>
                  {/* "Done" badge */}
                  <div className="inline-flex items-center gap-2 bg-[#E8EDF2] text-[#001734] px-4 py-1.5 rounded-full text-[12.5px] font-bold mb-2">
                    <span className="w-2.5 h-2.5 bg-[#001734] rounded-full shrink-0" aria-hidden="true" />
                    {t.done}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#001734] tracking-tight">
                    {t.dashboardTitle}
                  </h1>
                  <p className="text-[13.5px] text-[#6B7F96] mt-1">
                    {t.fileLabel}:{' '}
                    <span className="font-semibold text-[#001734]">{file?.name ?? 'CV_Kamu.pdf'}</span>
                  </p>
                </div>

                {/* Upload Another CV — primary action button */}
                <button
                  onClick={resetUpload}
                  className="group flex items-center gap-2.5 bg-[#001734] hover:bg-[#002C59] text-white px-5 py-3 rounded-xl text-[13.5px] font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0"
                  aria-label={t.uploadBtn}
                >
                  <svg
                    className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t.uploadBtn}
                </button>
              </header>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left Column ─────────────────────────────────────────── */}
                <aside className="lg:col-span-1 space-y-5">

                  {/* Career Field Card */}
                  <div className="bg-gradient-to-r from-[#001734] to-[#002C59] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    {/* Decorative circles */}
                    <span aria-hidden="true" className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
                    <span aria-hidden="true" className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/5" />

                    <p className="text-[#7EA8CC] text-[10.5px] font-bold uppercase tracking-widest mb-2 relative z-10">
                      {t.recommendedDomain}
                    </p>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h2 className="text-[20px] font-bold leading-snug">{aiData.rekomendasi_utama_bidang}</h2>
                    </div>
                  </div>

                  {/* Skills Card */}
                  <div className="bg-white border border-[#E2EAF4] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-[13px] font-bold text-[#001734] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 bg-[#E8EEF7] rounded-md flex items-center justify-center">
                        <svg className="w-3 h-3 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      {t.skillsFound}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {/* Visible skills */}
                      {visibleSkills.map((skill, i) => {
                        const c = SKILL_COLORS[i % SKILL_COLORS.length];
                        return (
                          <span
                            key={skill}
                            className="px-3 py-1.5 rounded-full text-[12.5px] font-semibold border"
                            style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
                          >
                            {skill}
                          </span>
                        );
                      })}

                      {/* Locked skills badge */}
                      {lockedSkillsCount > 0 && (
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-1.5 bg-[#FFF5F5] border border-dashed border-[#FEB2B2] text-[#C53030] px-3.5 py-1.5 rounded-full text-[12px] font-bold hover:bg-[#FED7D7] transition-colors"
                          title={t.moreSkillsLocked}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          +{lockedSkillsCount} {t.moreSkillsLocked}
                        </Link>
                      )}
                    </div>
                  </div>
                </aside>

                {/* ── Right Column: Job Cards ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">
                  <h2 className="text-[17px] font-bold text-[#001734] flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t.topJobs}
                  </h2>

                  {aiData.top_3_loker.map((job, idx) => {
                    const isLocked = !user && idx > 0;

                    if (!isLocked) {
                      return (
                        /* ── Job Card: Fully Visible (idx === 0) ── */
                        <article
                          key={job.posisi}
                          className="bg-white border border-[#E2EAF4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                        >
                          {/* Accent line top */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#001734] to-[#002C59] rounded-t-2xl" aria-hidden="true" />

                          {/* Match Score Badge */}
                          <div
                            className="absolute right-5 top-5 flex items-baseline gap-1 bg-gradient-to-r from-[#001734] to-[#002C59] text-white px-3.5 py-1.5 rounded-full shadow-md"
                            aria-label={`${t.matchScore} ${job.skor_match}%`}
                          >
                            <span className="text-[15px] font-bold">{job.skor_match}%</span>
                            <span className="text-[10px] text-blue-200 font-medium uppercase tracking-wide">{t.matchScore}</span>
                          </div>

                          {/* Company & Position */}
                          <div className="pr-28 mb-5 mt-1">
                            <h3 className="text-[17px] font-bold text-[#001734] leading-snug mb-1">
                              {job.posisi}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-[#6B7F96]">
                              <span className="font-semibold text-[#001734]/80">{job.perusahaan}</span>
                              <span aria-hidden="true" className="text-[#CBD5E1]">•</span>
                              <span>{job.industri}</span>
                            </div>
                          </div>

                          {/* Skill Roadmap */}
                          <div className="pt-4 border-t border-[#EEF3FA]">
                            <h4 className="text-[11.5px] font-bold text-[#001734] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <span aria-hidden="true" className="w-1.5 h-1.5 bg-[#001734] rounded-full" />
                              {t.skillGapTitle}
                            </h4>
                            <p className="text-[12px] text-[#8A9AB0] mb-3">{t.skillGapSubtitle}</p>
                            <div className="flex flex-wrap gap-2">
                              {job.saran_belajar.map((skill, i) => {
                                const learnUrl = job.link_belajar && job.link_belajar[i] ? job.link_belajar[i] : null;

                                if (learnUrl) {
                                  return (
                                    <a
                                      key={skill}
                                      href={learnUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] px-3 py-1 rounded-lg text-[12px] font-semibold hover:bg-[#FFEDD5] transition-colors cursor-pointer group/skill"
                                    >
                                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                      {skill}
                                    </a>
                                  );
                                }

                                return (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] px-3 py-1 rounded-lg text-[12px] font-semibold"
                                  >
                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Lamar Sekarang Button */}
                          <div className="mt-5 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                let targetUrl = job.link_lamaran || (job as any).url || (job as any).apply_url;

                                if (!targetUrl) {
                                  const searchQuery = encodeURIComponent(`${job.posisi} ${job.perusahaan}`);
                                  targetUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`;
                                }

                                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                              }}
                              className="bg-[#001734] hover:bg-[#002C59] text-white text-[13px] font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                            >
                              {language === 'id' ? 'Lamar Sekarang' : 'Apply Now'}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </article>
                      );
                    }

                    return (
                      /* ── Job Card: Locked (idx > 0) ── */
                      <div
                        key={job.posisi}
                        className="relative rounded-2xl border border-[#E2EAF4] overflow-hidden shadow-sm"
                        aria-label={t.jobLockedTitle}
                      >
                        {/* Skeleton background (blurred) */}
                        <div className="p-6 bg-white select-none pointer-events-none space-y-4 filter blur-[4px] opacity-35" aria-hidden="true">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 w-2/3">
                              <div className="h-5 bg-[#DDE6F0] rounded-lg w-3/4" />
                              <div className="h-4 bg-[#DDE6F0] rounded-lg w-1/2" />
                            </div>
                            <div className="h-8 bg-[#DDE6F0] rounded-full w-20" />
                          </div>
                          <div className="pt-4 border-t border-[#EEF3FA] space-y-2">
                            <div className="h-3.5 bg-[#DDE6F0] rounded w-1/4" />
                            <div className="h-3 bg-[#DDE6F0] rounded w-3/4" />
                            <div className="flex gap-2 mt-2">
                              <div className="h-7 bg-[#DDE6F0] rounded-lg w-20" />
                              <div className="h-7 bg-[#DDE6F0] rounded-lg w-16" />
                              <div className="h-7 bg-[#DDE6F0] rounded-lg w-24" />
                            </div>
                          </div>
                        </div>

                        {/* Lock Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/75 backdrop-blur-[2px] hover:bg-white/82 transition-colors">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#001734] to-[#003066] text-white rounded-2xl flex items-center justify-center mb-3 shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <h4 className="text-[14.5px] font-bold text-[#001734] mb-1">
                            {t.jobLockedTitle}
                          </h4>
                          <p className="text-[12px] text-[#6B7F96] max-w-[260px] mb-3 leading-relaxed">
                            {t.jobLockedDesc}
                          </p>
                          <Link
                            to="/login"
                            className="text-[12.5px] font-bold text-[#001734] hover:opacity-80 hover:underline transition-all"
                          >
                            {t.loginLink}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── CTA Banner ─────────────────────────────────────────────── */}
              {!user ? (
                <div className="relative bg-gradient-to-r from-[#001734] to-[#002C59] rounded-2xl p-8 md:p-10 text-white text-center overflow-hidden shadow-xl">
                  {/* Dot grid decoration */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                  />
                  {/* Glow orbs */}
                  <span aria-hidden="true" className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl" />
                  <span aria-hidden="true" className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl" />

                  <div className="relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
                      {t.ctaTitle}
                    </h2>
                    <p className="text-[#7EA8CC] text-[14px] leading-relaxed mb-7 max-w-[560px] mx-auto">
                      {t.ctaDesc}
                    </p>
                    <Link
                      to="/login"
                      className="inline-block bg-white text-[#001734] px-8 py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#EEF3FF] hover:-translate-y-0.5 transition-all duration-200 shadow-md active:translate-y-0"
                    >
                      {t.ctaButton}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="relative bg-[#E8EEF7] rounded-2xl p-6 md:p-8 text-[#001734] text-center shadow-sm border border-[#DDE6F0]">
                  <div className="relative z-10">
                    <h2 className="text-[17px] font-bold mb-2">
                      {language === 'id' ? 'Simpan Analisis Ini ke Profil Anda?' : 'Save This Analysis to Your Profile?'}
                    </h2>
                    <p className="text-[14px] text-[#6B7F96] mb-5 max-w-[560px] mx-auto">
                      {language === 'id' 
                        ? 'Analisis ini adalah sesi simulasi yang tidak tersimpan. Unggah CV melalui Dashboard untuk menyimpannya ke profil karier Anda.'
                        : 'This is an unsaved simulation session. Upload a CV via your Dashboard to save it to your career profile.'}
                    </p>
                    <Link
                      to="/dashboard"
                      className="inline-block bg-[#001734] text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-[#002C59] transition-all shadow-sm"
                    >
                      {language === 'id' ? 'Kembali ke Dashboard' : 'Return to Dashboard'}
                    </Link>
                  </div>
                </div>
              )}

            </section>
          )}

        </div>
      </main>

      <Footer />
      <ScrollToTop />
      </div>
    </div>
  );
};

export default UploadPage;
