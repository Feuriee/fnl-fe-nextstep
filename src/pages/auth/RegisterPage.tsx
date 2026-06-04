import { useState } from 'react'
import { Link } from 'react-router-dom'
import RegisterForm from '../../components/auth/RegisterForm'
import type { RegisterFormData } from '../../components/auth/RegisterForm'
import loginBg from '../../assets/login/login/daftar-page.png'

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = (data: RegisterFormData) => {
    setIsLoading(true)

    // Simulasi API call — akan diganti dengan fetch/axios ke backend nanti
    console.log('[RegisterPage] Attempting register with:', { email: data.email, name: data.fullName })

    setTimeout(() => {
      setIsLoading(false)
      // TODO: Integrasi dengan backend API endpoint /api/auth/register
    }, 1500)
  }

  return (
    // Menggunakan lg:flex-row-reverse agar di desktop branding di KANAN dan form di KIRI.
    // Di mobile tetap flex-col (branding di ATAS, form di BAWAH).
    // Menambahkan class animasi untuk transisi slide.
    <div className="min-h-screen flex flex-col lg:flex-row-reverse anim-slide-right">

      {/* ====== BRANDING PANEL ====== */}
      {/* Mobile: tampil di atas, stacked | Desktop: panel kanan 45% side-by-side */}
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

        {/* Konten Panel Branding */}
        <div className="relative z-10 flex flex-col flex-1 justify-between w-full p-6 pt-6 pb-12 sm:p-8 sm:pb-14 lg:p-12 lg:pt-24 lg:pb-12">

          {/* Header: Logo */}
          <div className="anim-fade-up flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-white text-[20px] sm:text-[22px] font-bold tracking-tight"
            >
              NextStep
            </Link>
          </div>

          {/* Testimonial di Bagian Bawah */}
          <div className="anim-slide-left mt-auto">
            <h2 className="text-white text-[22px] sm:text-[24px] lg:text-[28px] font-medium leading-snug mb-3">
              "NextStep memberikan kejelasan terstruktur yang anda butuhkan untuk meningkatkan jalur karier anda.""
            </h2>
            <p className="text-white/60 text-[14px]">
              © 2026 NextStep Capstone Project. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ====== FORM PANEL ====== */}
      {/* Mobile: timbul dengan rounded top + overlap lebih besar ke panel branding */}
      {/* Desktop: panel kiri 55% centered, tanpa radius/overlap */}
      <div className="flex-1 flex items-start lg:items-center justify-center bg-white px-6 pt-10 pb-10 sm:pt-12 sm:pb-12 lg:px-16 lg:py-0 rounded-t-[32px] lg:rounded-none -mt-8 lg:mt-0 relative z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-none">
        <div className="w-full max-w-[420px] anim-fade-up delay-100">



          {/* Heading */}
          <h1 className="text-[26px] sm:text-[28px] md:text-[32px] font-bold text-[#001734] mb-2">
            Buat Akun
          </h1>
          <p className="text-[#495057] text-[14px] mb-8 leading-relaxed">
            Mulailah perjalanan profesional Anda hari ini.
          </p>

          {/* Register Form Component */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        </div>
      </div>

    </div>
  )
}

export default RegisterPage
