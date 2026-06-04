import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'
import type { LoginFormData } from '../../components/auth/LoginForm'
import loginBg from '../../assets/login/login/daftar-page.png'

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (data: LoginFormData) => {
    setIsLoading(true)

    // Simulasi API call — akan diganti dengan fetch/axios ke backend nanti
    console.log('[LoginPage] Attempting login with:', { email: data.email })

    setTimeout(() => {
      setIsLoading(false)
      // TODO: Integrasi dengan backend API endpoint /api/auth/login
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ====== BRANDING PANEL ====== */}
      {/* Mobile: tampil di atas, stacked | Desktop: panel kiri 45% side-by-side */}
      <div className="relative overflow-hidden min-h-[55vh] lg:min-h-screen lg:w-[45%] flex flex-col">
        {/* Background Image */}
        <img
          src={loginBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Overlay untuk kontras teks */}
        <div className="absolute inset-0 bg-[#001734]/70 lg:bg-[#001734]/60" />

        {/* Konten Panel Branding — pb-12 mobile agar teks lebih ke bawah tapi tidak tertutup panel putih */}
        <div className="relative z-10 flex flex-col flex-1 justify-between w-full p-6 pt-6 pb-12 sm:p-8 sm:pb-14 lg:p-12 lg:pt-24 lg:pb-12">

          {/* Header: Tombol Kembali + Logo */}
          <div className="anim-fade-up flex items-center justify-between">
            {/* Tombol Kembali */}
            <Link
              to="/"
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors group"
              aria-label="Kembali ke halaman utama"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="text-[13px] font-medium">Kembali</span>
            </Link>

            {/* Logo */}
            <Link
              to="/"
              className="text-white text-[20px] sm:text-[22px] font-bold tracking-tight"
            >
              NextStep
            </Link>
          </div>

          {/* Tagline di Bagian Bawah */}
          <div className="anim-slide-left mt-auto">
            <h2 className="text-white text-[28px] sm:text-[32px] lg:text-[38px] font-bold leading-[1.15] mb-4 lg:mb-5">
              Majukan karier
              <br />
              Anda dengan
              <br />
              NexStep
            </h2>
            <p className="text-white/60 text-[13px] sm:text-[14px] leading-relaxed max-w-[400px]">
              Bergabunglah dengan platform yang dirancang
              untuk nenemukan reknmendasi pekerjaan anda sesuai
              tren kerja saat ini.
            </p>
          </div>
        </div>
      </div>

      {/* ====== FORM PANEL ====== */}
      {/* Mobile: timbul dengan rounded top + overlap lebih besar ke panel branding */}
      {/* Desktop: panel kanan 55% centered, tanpa radius/overlap */}
      <div className="flex-1 flex items-start lg:items-center justify-center bg-white px-6 pt-10 pb-10 sm:pt-12 sm:pb-12 lg:px-16 lg:py-0 rounded-t-[32px] lg:rounded-none -mt-8 lg:mt-0 relative z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-none">
        <div className="w-full max-w-[420px] anim-fade-up">

          {/* Heading */}
          <h1 className="text-[26px] sm:text-[28px] md:text-[32px] font-bold text-[#001734] mb-2">
            Sign in
          </h1>
          <p className="text-[#495057] text-[14px] mb-8 leading-relaxed">
            Masukkan kredensial Anda untuk mengakses akun Anda.
          </p>

          {/* Login Form Component */}
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>

    </div>
  )
}

export default LoginPage
