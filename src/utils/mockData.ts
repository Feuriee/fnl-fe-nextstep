// ============================================================
// FILE: src/utils/mockData.ts
// DESKRIPSI: Semua data simulasi (mock) untuk Dashboard NextStep.
//
// CATATAN UNTUK TIM BACKEND & AI ENGINEER:
//   - File ini adalah pengganti sementara untuk API call yang belum tersedia.
//   - Setelah backend siap, cukup hapus/ganti data di sini dengan
//     fungsi fetch ke API endpoint yang sesuai.
//   - Lihat komentar TODO di DashboardPage.tsx untuk titik integrasi API.
//
// CATATAN DATA SCIENTIST:
//   - `MOCK_AI_RESPONSE.top_loker` menggambarkan output yang diharapkan
//     dari model rekomendasi pekerjaan setelah analisis CV.
//   - `MOCK_MARKET_TRENDS` menggambarkan data tren pasar yang idealnya
//     berasal dari pipeline data kalian.
// ============================================================

import type { AIResponseData, MarketTrend, LearnResource } from '../types/dashboard';

// ─── Simulasi Response AI (Output Model Rekomendasi Pekerjaan) ──────────────
// TODO (AI Engineer): Ganti dengan response dari endpoint POST /api/cv/analyze
export const MOCK_AI_RESPONSE: AIResponseData = {
  status: 'success',
  data_pelamar: {
    skill_terdeteksi: [],
  },
  rekomendasi_utama_bidang: '',
  top_loker: [],
};

// ─── Data Tren Pasar Kerja ───────────────────────────────────────────────────
// TODO (Data Scientist): Ganti dengan data real dari pipeline tren pasar kalian
// Endpoint yang diharapkan: GET /api/market/trends
export const MOCK_MARKET_TRENDS: MarketTrend[] = [
  { skill: 'TypeScript', persentase: 94, tren: 'naik' },
  { skill: 'React / Next.js', persentase: 91, tren: 'naik' },
  { skill: 'Cloud (AWS/GCP)', persentase: 88, tren: 'naik' },
  { skill: 'AI / LLM Integration', persentase: 85, tren: 'naik' },
  { skill: 'Python', persentase: 82, tren: 'stabil' },
  { skill: 'Kubernetes', persentase: 73, tren: 'naik' },
  { skill: 'jQuery', persentase: 28, tren: 'turun' },
];

// ─── Rekomendasi Sumber Belajar ──────────────────────────────────────────────
// TODO (Backend): Ganti dengan data dari tabel `learn_resources` di database
// Endpoint yang diharapkan: GET /api/learn-resources?skills=TypeScript,Docker
export const MOCK_LEARN_RESOURCES: LearnResource[] = [
  {
    id: 1,
    judul: 'Belajar Fundamental TypeScript',
    platform: 'Dicoding',
    skill_target: 'TypeScript',
    durasi: '14 jam',
    rating: 4.8,
    url: 'https://www.dicoding.com/',
  },
  {
    id: 2,
    judul: 'React Testing Library — Dari Nol',
    platform: 'Udemy',
    skill_target: 'React Testing Library',
    durasi: '8 jam',
    rating: 4.7,
    url: 'https://www.udemy.com/',
  },
  {
    id: 3,
    judul: 'Pengantar Docker & Kontainerisasi',
    platform: 'Coursera',
    skill_target: 'Docker',
    durasi: '10 jam',
    rating: 4.6,
    url: 'https://www.coursera.org/',
  },
  {
    id: 4,
    judul: 'System Design Interview Mastery',
    platform: 'ByteByteGo',
    skill_target: 'System Design',
    durasi: '20 jam',
    rating: 4.9,
    url: 'https://bytebytego.com/',
  },
];

// ─── Key untuk Penyimpanan Browser ──────────────────────────────────────────
// Gunakan konstanta ini agar konsisten di seluruh codebase
export const STORAGE_KEYS = {
  SESSION_USER: 'nextstep_user',         // sessionStorage — data login user
  LOCAL_LANG: 'nextstep_lang',           // localStorage — preferensi bahasa
  LOCAL_SAVED_JOBS: 'nextstep_saved_jobs', // localStorage — daftar lowongan tersimpan
} as const;
