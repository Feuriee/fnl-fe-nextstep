// ============================================================
// FILE: src/context/AuthContext.tsx
// DESKRIPSI: Context global untuk manajemen sesi login user.
//
// CARA KERJA:
//   - JWT token disimpan di localStorage (persisten antar tab)
//   - Data user disimpan di sessionStorage (terhapus saat tab ditutup)
//   - Interceptor Axios di `src/services/api.ts` secara otomatis
//     menyisipkan token di setiap request ke backend.
// ============================================================

import React, { createContext, useState, useContext, useCallback } from 'react';
import type { UserSession } from '../types/dashboard';
import { STORAGE_KEYS } from '../utils/mockData';
import { STORAGE_TOKEN_KEY } from '../services/api';

// ─── Tipe data yang tersedia dari context ini ────────────────
interface AuthContextProps {
  user: UserSession | null;       // Data user yang sedang login (null jika belum login)
  token: string | null;           // JWT token untuk request ke backend
  isLoggedIn: boolean;            // Shortcut: apakah user sudah login?
  login: (userData: UserSession, jwtToken: string) => void;  // Fungsi untuk simpan data login + token
  logout: () => void;             // Fungsi untuk hapus sesi login
  updateUser: (fields: Partial<UserSession>) => void; // Fungsi untuk update data user dinamis
}

// Buat context dengan nilai default undefined
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// ─── Provider Component ──────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Baca JWT token dari localStorage (persisten antar tab)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  });

  // Coba baca data user dari sessionStorage saat aplikasi pertama kali dimuat.
  // Ini memastikan user tetap login jika mereka me-refresh halaman (selama tab masih terbuka).
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.SESSION_USER);
    if (saved) {
      try {
        return JSON.parse(saved) as UserSession;
      } catch {
        // Jika data corrupt, hapus saja
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);
        return null;
      }
    }
    return null;
  });

  // ── Fungsi Login ─────────────────────────────────────────────
  // Simpan JWT token ke localStorage dan data user ke sessionStorage.
  const login = useCallback((userData: UserSession, jwtToken: string) => {
    // Simpan token di localStorage agar persisten dan bisa dipakai interceptor Axios
    localStorage.setItem(STORAGE_TOKEN_KEY, jwtToken);
    setToken(jwtToken);

    // Simpan data user di sessionStorage
    setUser(userData);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(userData));
  }, []);

  // ── Fungsi Logout ─────────────────────────────────────────────
  // Hapus semua data sesi dari localStorage/sessionStorage dan reset state.
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    setToken(null);
    setUser(null);
  }, []);

  // ── Fungsi Update User ─────────────────────────────────────────
  // Update field user tertentu di state dan sessionStorage
  const updateUser = useCallback((fields: Partial<UserSession>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      sessionStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: user !== null && token !== null,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook untuk mengakses AuthContext ──────────────────
// Gunakan hook ini di komponen mana saja yang butuh data user atau fungsi auth.
// Contoh: const { user, isLoggedIn, logout } = useAuthContext();
export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext harus digunakan di dalam AuthProvider');
  }
  return context;
};
