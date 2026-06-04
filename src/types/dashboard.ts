// ============================================================
// FILE: src/types/dashboard.ts
// DESKRIPSI: Semua interface/tipe TypeScript untuk fitur Dashboard.
//
// CATATAN:
//   - Interface `UserSession` mencerminkan data user dari backend (Sequelize/PostgreSQL)
//   - Interface `AIResponseData` adalah format mock data untuk UploadPage (simulasi)
//   - Interface `RecommendationData` adalah format data nyata dari API backend
// ============================================================

// ─── Sesi User (disimpan di sessionStorage) ─────────────────
// Dibuat saat user berhasil login/register dari response API.
export interface UserSession {
  id?: string;           // UUID user dari database
  name: string;          // Nama lengkap user
  email: string;         // Email user
  role?: string;         // Role user, default: 'user'
  hasCv?: boolean;       // Apakah user sudah pernah upload CV
  targetRole?: string;   // Bidang karier yang direkomendasikan AI
  avatar?: string;       // URL avatar (opsional)
  // Field lama yang masih dipertahankan untuk kompatibilitas
  cvFileName?: string;   // Nama file CV terakhir yang diunggah (dari mock)
  cvUploadedAt?: string; // Tanggal upload CV (format: ISO string)
  cvs?: { filename: string; originalName: string }[];
}

// ─── Output AI: Data Satu Rekomendasi Lowongan ──────────────
// Digunakan di UploadPage (mock) dan DashboardPage (data nyata)
export interface JobRecommendation {
  posisi: string;          // Nama posisi pekerjaan
  perusahaan: string;      // Nama perusahaan
  industri: string;        // Bidang industri
  skor_match: number;      // Persentase kecocokan dengan CV (0-100)
  saran_belajar: string[]; // List skill yang perlu dipelajari untuk posisi ini
  link_lamaran?: string;   // Link untuk lamaran pekerjaan
  link_belajar?: string[]; // Link course belajar
  lokasi?: string;         // Lokasi kerja (opsional)
  gaji?: string;           // Kisaran gaji (opsional)
  tipe_kerja?: string;     // Tipe kerja (opsional)
  url?: string;            // Link lowongan asli (opsional)
}

// ─── Output AI: Response Lengkap Analisis CV (Mock Format) ──
// Digunakan di UploadPage simulasi dan sebagai fallback
export interface AIResponseData {
  status: string;
  data_pelamar: {
    skill_terdeteksi: string[];
  };
  rekomendasi_utama_bidang: string;
  top_loker: JobRecommendation[];
  // Field lama (UploadPage masih pakai top_3_loker)
  top_3_loker?: JobRecommendation[];
  isMock?: boolean;
}

// ─── Data Rekomendasi dari API Backend ──────────────────────
// Format yang dikembalikan oleh GET /api/v1/recommendations/latest
export interface APISkill {
  name: string;
  confidence: number;
}

export interface APIJobRecommendation {
  title: string;
  company: string;
  industry: string;
  matchScore: number;
  learningTips: string[];
  link_lamaran?: string;
  link_belajar?: string[];
  location?: string;
  type?: string;
  source?: string;
  url?: string;
}

export interface RecommendationData {
  id: string;
  userId: string;
  cvId: string;
  extractedSkills: APISkill[];
  suggestedField: string;
  jobRecommendations: APIJobRecommendation[];
  isRead: boolean;
  createdAt: string;
  cv?: {
    id: string;
    originalName: string;
    status: string;
    analyzedAt: string;
  };
}

// ── Helper: Konversi format backend → format frontend (mock-compatible) ──
// Fungsi ini memungkinkan DashboardPage memakai data backend
// dengan interface yang sama seperti MOCK_AI_RESPONSE
export function convertRecommendationToMockFormat(rec: RecommendationData): AIResponseData {
  return {
    status: 'success',
    data_pelamar: {
      skill_terdeteksi: rec.extractedSkills.map((s) => s.name),
    },
    rekomendasi_utama_bidang: rec.suggestedField || 'Tidak Tersedia',
    top_loker: rec.jobRecommendations.map((job) => ({
      posisi: job.title,
      perusahaan: job.company,
      industri: job.industry,
      skor_match: job.matchScore,
      saran_belajar: job.learningTips,
      link_lamaran: job.link_lamaran,
      link_belajar: job.link_belajar,
      lokasi: job.location,
      tipe_kerja: job.type,
      url: job.url,
    })),
    top_3_loker: rec.jobRecommendations.slice(0, 3).map((job) => ({
      posisi: job.title,
      perusahaan: job.company,
      industri: job.industry,
      skor_match: job.matchScore,
      saran_belajar: job.learningTips,
      link_lamaran: job.link_lamaran,
      link_belajar: job.link_belajar,
      lokasi: job.location,
      tipe_kerja: job.type,
      url: job.url,
    })),
    isMock: rec.jobRecommendations[0]?.source === 'mock_data',
  };
}

// ─── Tren Pasar Kerja ────────────────────────────────────────
export interface MarketTrend {
  skill: string;
  persentase: number;
  tren: 'naik' | 'turun' | 'stabil';
}

// ─── Sumber Belajar / Rekomendasi Kursus ─────────────────────
export interface LearnResource {
  id: number;
  judul: string;
  platform: string;
  skill_target: string;
  durasi?: string;
  rating?: number;
  url?: string;
}

// ─── Lowongan yang Disimpan User ─────────────────────────────
export interface SavedJob extends JobRecommendation {
  savedAt: string;
}
