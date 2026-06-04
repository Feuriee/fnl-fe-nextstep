// ============================================================
// FILE: src/services/api.ts
// DESKRIPSI: Axios instance terpusat untuk semua API call ke backend.
//
// FITUR:
//   - Base URL dari VITE_API_URL atau fallback ke localhost:5000
//   - Interceptor REQUEST: sisipkan JWT token otomatis dari localStorage
//   - Interceptor RESPONSE: handle 401 → hapus token dan redirect ke /login
// ============================================================

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const STORAGE_TOKEN_KEY = 'nextstep_token';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 detik
});

// ── Request Interceptor ──────────────────────────────────────
// Sisipkan JWT token di header Authorization setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
// Handle error global (401 = sesi expired → hapus token & redirect login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hapus data sesi yang sudah tidak valid
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem('nextstep_user');
      // Redirect ke login (hanya jika belum di halaman auth)
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth API ─────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      hasCv: boolean;
      targetRole?: string;
      avatar?: string;
      cvs?: {
        id: string;
        filename: string;
        originalName: string;
        filePath: string;
      }[];
    };
  };
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  getMe: () =>
    api.get<{ success: boolean; data: AuthResponse['data']['user'] }>('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/update-password', { currentPassword, newPassword }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  verifyOtp: (email: string, otp: string) =>
    api.post<{ success: boolean; message: string; data: { reset_token: string } }>('/auth/verify-otp', { email, otp }),

  resetPassword: (reset_token: string, new_password: string) =>
    api.post('/auth/reset-password', { reset_token, new_password }),
};

// ── User API ─────────────────────────────────────────────────

export const userApi = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (data: { name?: string; targetRole?: string }) =>
    api.patch('/users/profile', data),
};

// ── CV API ───────────────────────────────────────────────────

export interface CVStatusResponse {
  success: boolean;
  data: {
    cvId: string;
    status: 'pending' | 'processing' | 'analyzed' | 'failed';
    analyzedAt?: string;
    suggestedField?: string;
    skillCount?: number;
    error?: string;
  };
}

export const cvApi = {
  /**
   * Upload CV untuk user yang sudah login.
   * Backend memproses AI di background → gunakan polling getStatus().
   */
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 1 menit untuk upload
    });
  },

  /**
   * Analisis CV tanpa login (untuk halaman simulasi UploadPage).
   * Backend langsung menunggu hasil AI dan mengembalikannya.
   * TIDAK menyimpan apapun ke database.
   */
  analyzePublic: (file: File) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api.post<{
      success: boolean;
      data: {
        status: string;
        data_pelamar: { skill_terdeteksi: string[] };
        rekomendasi_utama_bidang: string;
        top_3_loker: Array<{
          posisi: string;
          perusahaan: string;
          industri: string;
          skor_match: number;
          saran_belajar: string[];
        }>;
      };
    }>('/cv/analyze-public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 150000, // 2.5 menit (Hugging Face cold start bisa lama)
    });
  },

  getStatus: (cvId: string) =>
    api.get<CVStatusResponse>(`/cv/${cvId}/status`),

  getMyCVs: () => api.get('/cv'),
};

// ── Recommendation API ───────────────────────────────────────

export interface JobRec {
  title: string;
  company: string;
  industry: string;
  matchScore: number;
  learningTips: string[];
  location?: string;
  type?: string;
  source?: string;
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    id: string;
    userId: string;
    cvId: string;
    extractedSkills: Array<{ name: string; confidence: number }>;
    suggestedField: string;
    jobRecommendations: JobRec[];
    isRead: boolean;
    createdAt: string;
    cv?: {
      id: string;
      originalName: string;
      status: string;
      analyzedAt: string;
    };
  };
}

export const recommendationApi = {
  getLatest: () => api.get<RecommendationResponse>('/recommendations/latest'),

  getAll: (page = 1, limit = 5) =>
    api.get(`/recommendations?page=${page}&limit=${limit}`),

  getById: (id: string) => api.get(`/recommendations/${id}`),
};

// ── Saved Job API ───────────────────────────────────────────

export const savedJobApi = {
  getAll: () => api.get('/saved-jobs'),

  save: (jobData: {
    posisi: string;
    perusahaan: string;
    industri: string;
    skor_match: number;
    saran_belajar: string[];
    link_lamaran?: string;
    link_belajar?: string[];
    lokasi?: string;
    tipe_kerja?: string;
  }) => api.post('/saved-jobs', jobData),

  unsaveByQuery: (posisi: string, perusahaan: string) =>
    api.delete('/saved-jobs', { params: { posisi, perusahaan } }),
};
