// ============================================================
// FILE: src/App.tsx
// DESKRIPSI: Root component — setup routing dan global providers.
//
// PROVIDERS yang dipakai (dari luar ke dalam):
//   1. LanguageProvider — menyediakan state bahasa ID/EN ke seluruh app
//   2. AuthProvider     — menyediakan state sesi login ke seluruh app
//   3. BrowserRouter    — routing berbasis URL browser
//
// ROUTES:
//   /                 → HomePage
//   /upload           → UploadPage (simulasi CV tanpa login)
//   /login            → AuthPage (mode login)
//   /register         → AuthPage (mode register)
//   /forgot-password  → AuthPage (mode lupa password — OTP 3-step flow)
//   /dashboard        → DashboardPage (protected — redirect ke /login jika belum login)
// ============================================================

import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
// Import AuthProvider agar data sesi login tersedia di seluruh komponen
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import AuthPage from './pages/auth/AuthPage'
import UploadPage from './pages/cv/UploadPage'
import SplashPage from './pages/SplashPage'
import DashboardPage from './pages/dashboard/DashboardPage'

function App() {
  const [showSplash, setShowSplash] = useState(() => window.location.pathname === '/')

  return (
    // LanguageProvider paling luar agar bahasa tersedia di semua komponen termasuk AuthProvider
    <LanguageProvider>
      {/* AuthProvider memberikan akses data login ke Navbar, Dashboard, dan halaman lainnya */}
      <AuthProvider>
        {showSplash && <SplashPage onFinish={() => setShowSplash(false)} />}

        {/*
          Sembunyikan konten utama selama splash screen aktif
          agar tidak terjadi layout shift atau interaksi yang tidak diinginkan
        */}
        <div className={showSplash ? 'hidden' : 'block'}>
          <BrowserRouter>
            <Routes>
              {/* Halaman Utama */}
              <Route path="/" element={<HomePage />} />

              {/* Simulasi Upload CV — bisa diakses tanpa login */}
              <Route path="/upload" element={<UploadPage />} />

              {/* Halaman Autentikasi */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />

              {/* Dashboard — protected route, redirect ke /login jika belum login */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Lupa Password */}
              <Route path="/forgot-password" element={<AuthPage />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App