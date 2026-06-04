// ============================================================
// FILE: src/hooks/useAuth.ts
// DESKRIPSI: Custom hook untuk kemudahan akses data autentikasi.
//
// PENGGUNAAN:
//   import { useAuth, useRequireAuth } from '../hooks/useAuth';
//
//   // Di komponen biasa (hanya ingin baca data user):
//   const { user, isLoggedIn, logout } = useAuth();
//
//   // Di halaman yang harus dilindungi (redirect jika belum login):
//   const { user } = useRequireAuth(); // Otomatis redirect ke /login jika belum login
// ============================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

// ─── Hook Dasar: Akses data auth ─────────────────────────────
// Gunakan di komponen mana saja yang perlu cek status login atau data user.
export const useAuth = () => {
  return useAuthContext();
};

// ─── Hook Proteksi Halaman ────────────────────────────────────
// Gunakan di halaman-halaman yang hanya boleh diakses user yang sudah login.
// Jika belum login → otomatis redirect ke /login.
export const useRequireAuth = () => {
  const auth = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Jika user belum login (tidak ada data di sessionStorage), arahkan ke login
    if (!auth.isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [auth.isLoggedIn, navigate]);

  return auth;
};
