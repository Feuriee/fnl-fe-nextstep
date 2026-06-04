import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'
import RegisterForm from '../../components/auth/RegisterForm'
import type { LoginFormData } from '../../components/auth/LoginForm'
import type { RegisterFormData } from '../../components/auth/RegisterForm'
import loginBg from '../../assets/login/login/daftar-page.png'
import { useLanguage } from '../../context/LanguageContext'
import { useAuthContext } from '../../context/AuthContext'
import { authApi } from '../../services/api'

type Step = 'email' | 'otp' | 'new-password' | 'success'

// ── Komponen Eye Icon ─────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

const AuthPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { language, toggleLanguage } = useLanguage()
  const { login } = useAuthContext()

  // ── Mode & Animation State ─────────────────────────────────
  const isForgotPage = location.pathname === '/forgot-password'
  const [isRegister, setIsRegister] = useState(location.pathname === '/register')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')

  const [mobileContentRegister, setMobileContentRegister] = useState(location.pathname === '/register')

  // Sync state when navigating directly via URL
  useEffect(() => {
    const isReg = location.pathname === '/register'
    setIsRegister(isReg)
    if (!isAnimating) {
      setMobileContentRegister(isReg)
    }
  }, [location.pathname, isAnimating])

  // Handle the halfway swap for mobile layout horizontal transitions
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setMobileContentRegister(isRegister)
      }, 350)
      return () => clearTimeout(timer)
    } else {
      setMobileContentRegister(isRegister)
    }
  }, [isRegister, isAnimating])

  const switchMode = (toRegister: boolean) => {
    if (isAnimating || toRegister === isRegister) return
    setIsAnimating(true)
    setIsRegister(toRegister)

    // Update URL smoothly
    navigate(toRegister ? '/register' : '/login', { replace: true })

    setTimeout(() => {
      setIsAnimating(false)
    }, 700)
  }

  // ── Lupa Password Flow State & Handlers ───────────────────────
  const [forgotStep, setForgotStep] = useState<Step>('email')
  
  // Step 1: Email
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotEmailError, setForgotEmailError] = useState('')
  const [forgotEmailLoading, setForgotEmailLoading] = useState(false)

  // Step 2: OTP
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', ''])
  const [forgotOtpError, setForgotOtpError] = useState('')
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Step 3: Password Baru
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [newPasswordError, setNewPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [resetToken, setResetToken] = useState('')

  // ── Reset Forgot State when entering/exiting forgot mode ───
  useEffect(() => {
    if (!isForgotPage) {
      const timer = setTimeout(() => {
        setForgotStep('email')
        setForgotEmail('')
        setForgotEmailError('')
        setForgotOtp(['', '', '', '', '', ''])
        setForgotOtpError('')
        setNewPassword('')
        setConfirmPassword('')
        setNewPasswordError('')
        setConfirmPasswordError('')
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isForgotPage])

  // Countdown timer for OTP
  useEffect(() => {
    if (forgotStep !== 'otp' || !isForgotPage) return
    setCountdown(60)
    setCanResend(false)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [forgotStep, isForgotPage])

  // Auto focus first OTP input when reaching step 2
  useEffect(() => {
    if (forgotStep === 'otp' && isForgotPage) {
      setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    }
  }, [forgotStep, isForgotPage])

  // ── Forgot Password Validation Helpers ─────────────────────
  const validateForgotEmail = (v: string) => {
    if (!v.trim()) return language === 'id' ? 'Email wajib diisi.' : 'Email is required.'
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!re.test(v.trim())) return language === 'id' ? 'Format email tidak valid.' : 'Invalid email format.'
    return ''
  }

  const validateNewPassword = (v: string) => {
    if (!v) return language === 'id' ? 'Password wajib diisi.' : 'Password is required.'
    if (v.length < 8) return language === 'id' ? 'Password minimal 8 karakter.' : 'Minimum 8 characters.'
    return ''
  }

  const validateConfirmPassword = (v: string) => {
    if (!v) return language === 'id' ? 'Konfirmasi password wajib diisi.' : 'Please confirm your password.'
    if (v !== newPassword) return language === 'id' ? 'Password tidak cocok.' : 'Passwords do not match.'
    return ''
  }

  // ── Handlers for Forgot Password Steps ──────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateForgotEmail(forgotEmail)
    setForgotEmailError(err)
    if (err) return

    setForgotEmailLoading(true)
    try {
      await authApi.forgotPassword(forgotEmail)
      setForgotStep('otp')
    } catch (err: any) {
      setForgotEmailError(err.response?.data?.message || 'Gagal mengirim OTP.')
    } finally {
      setForgotEmailLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const updated = [...forgotOtp]
    updated[index] = value.slice(-1)
    setForgotOtp(updated)
    setForgotOtpError('')
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setForgotOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = forgotOtp.join('')
    if (code.length < 6) {
      setForgotOtpError(language === 'id' ? 'Masukkan 6 digit kode OTP.' : 'Enter the 6-digit OTP code.')
      return
    }

    setForgotOtpLoading(true)
    try {
      const res = await authApi.verifyOtp(forgotEmail, code)
      setResetToken(res.data.data.reset_token)
      setForgotStep('new-password')
    } catch (err: any) {
      setForgotOtpError(err.response?.data?.message || 'OTP tidak valid.')
    } finally {
      setForgotOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    setForgotOtp(['', '', '', '', '', ''])
    setForgotOtpError('')
    try {
      await authApi.forgotPassword(forgotEmail)
      setCountdown(60)
      setCanResend(false)
      otpRefs.current[0]?.focus()
    } catch (err: any) {
      setForgotOtpError(err.response?.data?.message || 'Gagal mengirim ulang OTP.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errNew = validateNewPassword(newPassword)
    const errConfirm = validateConfirmPassword(confirmPassword)
    setNewPasswordError(errNew)
    setConfirmPasswordError(errConfirm)
    if (errNew || errConfirm) return

    setPasswordLoading(true)
    try {
      await authApi.resetPassword(resetToken, newPassword)
      setForgotStep('success')
    } catch (err: any) {
      setNewPasswordError(err.response?.data?.message || 'Gagal mereset password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  // ── Handler Login ─────────────────────────────────────────────
  const handleLogin = async (data: LoginFormData) => {
    setIsLoginLoading(true)
    setLoginError('')
    try {
      const res = await authApi.login({ email: data.email, password: data.password })
      const { token, user: apiUser } = res.data.data
      // Simpan sesi ke context (token ke localStorage, user ke sessionStorage)
      login(
        {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          hasCv: apiUser.hasCv,
          targetRole: apiUser.targetRole,
        },
        token
      )
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'id' ? 'Login gagal. Coba lagi.' : 'Login failed. Please try again.')
      setLoginError(msg)
    } finally {
      setIsLoginLoading(false)
    }
  }

  // ── Handler Register ──────────────────────────────────────────
  const handleRegister = async (data: RegisterFormData) => {
    setIsRegisterLoading(true)
    setRegisterError('')
    try {
      const res = await authApi.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
      })
      const { token, user: apiUser } = res.data.data
      // Simpan sesi ke context
      login(
        {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          hasCv: apiUser.hasCv,
        },
        token
      )
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'id' ? 'Registrasi gagal. Coba lagi.' : 'Registration failed. Please try again.')
      setRegisterError(msg)
    } finally {
      setIsRegisterLoading(false)
    }
  }

  // Visual index for steps in Forgot Password visual guide
  const steps = [
    { key: 'email', label: language === 'id' ? 'Email' : 'Email' },
    { key: 'otp', label: 'OTP' },
    { key: 'new-password', label: language === 'id' ? 'Password Baru' : 'New Password' },
  ]
  const stepIndex = forgotStep === 'success' ? 3 : steps.findIndex(s => s.key === forgotStep)

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#001734] anim-page-enter">
      <style>
        {`
          @keyframes mobileSlideCover {
            0% { transform: translateY(0); }
            50% { transform: translateY(calc(-40vh)); }
            100% { transform: translateY(0); }
          }
          .mobile-slide-anim {
            animation: mobileSlideCover 0.7s cubic-bezier(0.65,0,0.35,1) forwards;
          }
        `}
      </style>

      {/* Container vertical scroll/slide wrapper */}
      <div
        className="w-full h-[200vh] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          transform: isForgotPage ? 'translateY(-100vh)' : 'translateY(0)',
        }}
      >
        {/* ========================================================================= */}
        {/* SECTION 1: LOGIN / REGISTER PAGE (Top 100vh)                              */}
        {/* ========================================================================= */}
        <div className="h-screen w-full relative overflow-hidden flex flex-col lg:flex-row bg-[#001734]">
          
          {/* ────────────────── SECTION 1: MOBILE LAYOUT (< lg) ────────────────── */}
          <div className="lg:hidden flex flex-col h-full w-full bg-[#001734] overflow-hidden">
            {/* Mobile Branding Banner - Optimized height 38vh for maximum scroll space */}
            <div className="relative overflow-hidden h-[38vh] flex flex-col flex-shrink-0">
              <img
                src={loginBg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#001734]/70" />

              <div className="relative z-10 flex flex-col justify-between h-full w-full p-5 pt-5 pb-8 flex-1">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      to={mobileContentRegister ? "/login" : "/"}
                      onClick={(e) => {
                        if (mobileContentRegister) {
                          e.preventDefault()
                          switchMode(false)
                        }
                      }}
                      className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors group"
                      aria-label="Kembali"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="text-[12px] font-semibold">{language === 'id' ? 'Kembali' : 'Back'}</span>
                    </Link>

                    {/* Language toggle - mobile */}
                    <button
                      onClick={toggleLanguage}
                      className="flex items-center gap-1.5 text-white/70 hover:text-white transition-all"
                      aria-label="Toggle language"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">{language}</span>
                    </button>
                  </div>

                  <Link to="/" className="text-white text-[18px] sm:text-[20px] font-extrabold tracking-tight">
                    NextStep
                  </Link>
                </div>

                {/* Tagline Area - Compact, neat, and highly visible */}
                <div className="mt-auto transition-opacity duration-300">
                  {mobileContentRegister ? (
                    <>
                      <h2 className="text-white text-[18px] sm:text-[20px] font-bold leading-snug mb-1 text-white/95">
                        {language === 'id' ? 'Daftar Akun Baru' : 'Create New Account'}
                      </h2>
                      <p className="text-white/70 text-[12px] sm:text-[13px] leading-relaxed line-clamp-2">
                        {language === 'id'
                          ? 'NextStep memberikan kejelasan terstruktur yang anda butuhkan untuk meningkatkan jalur karier anda.'
                          : 'NextStep gives you the structured clarity you need to advance your career path.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-white text-[22px] sm:text-[24px] font-bold leading-tight mb-1 text-white/95">
                        {language === 'id' ? 'Majukan karier Anda dengan NexStep' : 'Advance your career with NexStep'}
                      </h2>
                      <p className="text-white/70 text-[12px] sm:text-[13px] leading-relaxed line-clamp-2">
                        {language === 'id'
                          ? 'Bergabunglah dengan platform yang dirancang untuk menemukan rekomendasi pekerjaan anda sesuai tren kerja saat ini.'
                          : 'Join the platform designed to match you with the best job opportunities based on current market trends.'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Form Panel - Scrollable flex-1 Container */}
            <div
              className={`flex-1 overflow-y-auto bg-white px-6 pt-8 pb-8 sm:px-8 rounded-t-[32px] -mt-6 relative z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-all ${isAnimating ? 'mobile-slide-anim' : ''}`}
            >
              <div
                className="w-full max-w-[420px] mx-auto pb-4"
                style={{
                  transition: 'opacity 0.2s',
                  opacity: isAnimating ? 0 : 1
                }}
              >
                {mobileContentRegister ? (
                  <div className="animate-fade-in">
                    <h1 className="text-[24px] font-bold text-[#001734] mb-1">
                      {language === 'id' ? 'Buat Akun' : 'Create Account'}
                    </h1>
                    <p className="text-[#6C757D] text-[13px] mb-6 leading-relaxed">
                      {language === 'id' ? 'Mulailah perjalanan profesional Anda hari ini.' : 'Start your professional journey today.'}
                    </p>
                    {registerError && (
                      <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600 font-medium">
                        {registerError}
                      </div>
                    )}
                    <RegisterForm onSubmit={handleRegister} isLoading={isRegisterLoading} switchToLogin={() => switchMode(false)} />
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <h1 className="text-[24px] font-bold text-[#001734] mb-1">
                      {language === 'id' ? 'Masuk' : 'Sign In'}
                    </h1>
                    <p className="text-[#6C757D] text-[13px] mb-6 leading-relaxed">
                      {language === 'id' ? 'Masukkan kredensial Anda untuk mengakses akun Anda.' : 'Enter your credentials to access your account.'}
                    </p>
                    {loginError && (
                      <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600 font-medium">
                        {loginError}
                      </div>
                    )}
                    <LoginForm
                      onSubmit={handleLogin}
                      isLoading={isLoginLoading}
                      switchToRegister={() => switchMode(true)}
                      switchToForgotPassword={() => navigate('/forgot-password')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ────────────────── SECTION 1: DESKTOP LAYOUT (>= lg) ────────────────── */}
          <div className="hidden lg:block relative w-full h-full">
            {/* Sliding Branding Panel */}
            <div
              className="absolute top-0 bottom-0 w-[45%] z-30 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{
                left: isRegister ? '55%' : '0%',
              }}
            >
              <div className="relative overflow-hidden w-full h-full flex flex-col">
                <img
                  src={loginBg}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#001734]/60" />

                <div className="relative z-10 flex flex-col justify-between h-full w-full p-10 pt-16 pb-12">
                  {/* Desktop Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link
                        to={isRegister ? "/login" : "/"}
                        onClick={(e) => {
                          if (isRegister) {
                            e.preventDefault()
                            switchMode(false)
                          }
                        }}
                        className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors group"
                        aria-label="Kembali"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span className="text-[13px] font-semibold">{language === 'id' ? 'Kembali' : 'Back'}</span>
                      </Link>

                      <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1 text-white/70 hover:text-white transition-all"
                        aria-label="Toggle language"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest">{language}</span>
                      </button>
                    </div>

                    <Link to="/" className="text-white text-[22px] font-extrabold tracking-tight">
                      NextStep
                    </Link>
                  </div>

                  {/* Brand Taglines */}
                  <div className="mt-auto">
                    {/* Login branding */}
                    <div
                      className="transition-all duration-500"
                      style={{
                        opacity: isRegister ? 0 : 1,
                        transform: isRegister ? 'translateY(20px)' : 'translateY(0)',
                        position: isRegister ? 'absolute' : 'relative',
                        bottom: isRegister ? '40px' : 'auto',
                        left: isRegister ? '40px' : 'auto',
                        right: isRegister ? '40px' : 'auto',
                        pointerEvents: isRegister ? 'none' : 'auto',
                      }}
                    >
                      <h2 className="text-white text-[34px] font-bold leading-tight mb-4">
                        {language === 'id' ? (
                          <>Majukan karier<br />Anda dengan<br />NexStep</>
                        ) : (
                          <>Advance your career<br />with NexStep</>
                        )}
                      </h2>
                      <p className="text-white/65 text-[14px] leading-relaxed max-w-[380px]">
                        {language === 'id'
                          ? 'Bergabunglah dengan platform yang dirancang untuk menemukan rekomendasi pekerjaan anda sesuai tren kerja saat ini.'
                          : 'Join the platform designed to match you with the best job opportunities based on current market trends.'}
                      </p>
                    </div>

                    {/* Register branding */}
                    <div
                      className="transition-all duration-500"
                      style={{
                        opacity: isRegister ? 1 : 0,
                        transform: isRegister ? 'translateY(0)' : 'translateY(20px)',
                        position: isRegister ? 'relative' : 'absolute',
                        bottom: isRegister ? 'auto' : '40px',
                        left: isRegister ? 'auto' : '40px',
                        right: isRegister ? 'auto' : '40px',
                        pointerEvents: isRegister ? 'auto' : 'none',
                      }}
                    >
                      <h2 className="text-white text-[26px] font-medium leading-snug mb-3">
                        {language === 'id'
                          ? '"NextStep memberikan kejelasan terstruktur yang anda butuhkan untuk meningkatkan jalur karier anda."'
                          : '"NextStep gives you the structured clarity you need to advance your career path."'}
                      </h2>
                      <p className="text-white/60 text-[13px]">
                        © 2026 NextStep Capstone Project. All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Form Panels (Left: Register Form, Right: Login Form) */}
            <div className="absolute inset-0 flex w-full h-full bg-white">
              {/* Left Form: Register */}
              <div className="w-[55%] h-full flex items-center justify-center">
                <div
                  className="w-full max-w-[420px] px-8 transition-all duration-500 delay-100"
                  style={{
                    opacity: isRegister ? 1 : 0,
                    transform: isRegister ? 'translateX(0)' : 'translateX(-40px)',
                    pointerEvents: isRegister ? 'auto' : 'none',
                  }}
                >
                  <h1 className="text-[28px] font-bold text-[#001734] mb-1">
                    {language === 'id' ? 'Buat Akun' : 'Create Account'}
                  </h1>
                  <p className="text-[#6C757D] text-[14px] mb-6 leading-relaxed">
                    {language === 'id' ? 'Mulailah perjalanan profesional Anda hari ini.' : 'Start your professional journey today.'}
                  </p>
                  {registerError && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600 font-medium">
                      {registerError}
                    </div>
                  )}
                  <RegisterForm onSubmit={handleRegister} isLoading={isRegisterLoading} switchToLogin={() => switchMode(false)} />
                </div>
              </div>

              {/* Right Form: Login */}
              <div className="w-[55%] h-full flex items-center justify-center">
                <div
                  className="w-full max-w-[420px] px-8 transition-all duration-500 delay-100"
                  style={{
                    opacity: isRegister ? 0 : 1,
                    transform: isRegister ? 'translateX(40px)' : 'translateX(0)',
                    pointerEvents: isRegister ? 'none' : 'auto',
                  }}
                >
                  <h1 className="text-[28px] font-bold text-[#001734] mb-1">
                    {language === 'id' ? 'Masuk' : 'Sign In'}
                  </h1>
                  <p className="text-[#6C757D] text-[14px] mb-6 leading-relaxed">
                    {language === 'id' ? 'Masukkan kredensial Anda untuk mengakses akun Anda.' : 'Enter your credentials to access your account.'}
                  </p>
                  {loginError && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600 font-medium">
                      {loginError}
                    </div>
                  )}
                  <LoginForm
                    onSubmit={handleLogin}
                    isLoading={isLoginLoading}
                    switchToRegister={() => switchMode(true)}
                    switchToForgotPassword={() => navigate('/forgot-password')}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: FORGOT PASSWORD PAGE (Bottom 100vh)                            */}
        {/* ========================================================================= */}
        <div className="h-screen w-full relative overflow-hidden flex flex-col lg:flex-row bg-[#001734]">
          
          {/* ────────────────── SECTION 2: MOBILE LAYOUT (< lg) ────────────────── */}
          <div className="lg:hidden flex flex-col h-full w-full bg-[#001734] overflow-hidden">
            {/* Mobile Branding Banner - Optimized height 38vh for maximum scroll space */}
            <div className="relative overflow-hidden h-[38vh] flex flex-col flex-shrink-0">
              <img
                src={loginBg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#001734]/70" />

              <div className="relative z-10 flex flex-col justify-between h-full w-full p-5 pt-5 pb-8 flex-1">
                {/* Header Row - Language next to back button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (forgotStep === 'otp') {
                          setForgotStep('email')
                        } else if (forgotStep === 'new-password') {
                          setForgotStep('otp')
                        } else {
                          navigate('/login')
                        }
                      }}
                      className="flex items-center gap-1 text-white/80 hover:text-white transition-colors group"
                      aria-label="Kembali"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="text-[12px] font-semibold">
                        {forgotStep === 'success' 
                          ? (language === 'id' ? 'Selesai' : 'Done') 
                          : (language === 'id' ? 'Kembali' : 'Back')}
                      </span>
                    </button>

                    {/* Language toggle - Section 2 mobile */}
                    <button
                      onClick={toggleLanguage}
                      className="flex items-center gap-1.5 text-white/70 hover:text-white transition-all"
                      aria-label="Toggle language"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">{language}</span>
                    </button>
                  </div>

                  <span className="text-white text-[18px] sm:text-[20px] font-extrabold tracking-tight">
                    NextStep
                  </span>
                </div>

                {/* Tagline Banner Area - static, clean & spacious */}
                <div className="mt-auto">
                  <h2 className="text-white text-[22px] sm:text-[24px] font-bold leading-tight mb-1 text-white/95">
                    {language === 'id' ? 'Reset Password' : 'Reset Password'}
                  </h2>
                  <p className="text-white/70 text-[12px] sm:text-[13px] leading-relaxed line-clamp-2">
                    {language === 'id' 
                      ? 'Kami membantu memandu Anda memulihkan akun dengan aman melalui langkah-langkah verifikasi terenkripsi.' 
                      : 'We help guide you to recover your account securely through encrypted verification steps.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Form Panel - Scrollable flex-1 Container */}
            <div className="flex-1 overflow-y-auto bg-white px-6 pt-8 pb-8 sm:px-8 rounded-t-[32px] -mt-6 relative z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
              <div className="w-full max-w-[420px] mx-auto pb-4">
                
                {/* Visual Step Progress Bar inside card */}
                {forgotStep !== 'success' && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-[12px] font-semibold text-[#6C757D] mb-1.5">
                      <span>
                        {forgotStep === 'email' && (language === 'id' ? 'Langkah 1 dari 3: Email' : 'Step 1 of 3: Email')}
                        {forgotStep === 'otp' && (language === 'id' ? 'Langkah 2 dari 3: Verifikasi OTP' : 'Step 2 of 3: OTP Verification')}
                        {forgotStep === 'new-password' && (language === 'id' ? 'Langkah 3 dari 3: Password Baru' : 'Step 3 of 3: New Password')}
                      </span>
                      <span className="text-[#001734] font-bold">{Math.round(((stepIndex + 1) / 3) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#DEE2E6] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#001734] transition-all duration-500 rounded-full" 
                        style={{ width: `${((stepIndex + 1) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 1: EMAIL (MOBILE) ── */}
                {forgotStep === 'email' && (
                  <div className="animate-fade-in">
                    <h1 className="text-[24px] font-bold text-[#001734] mb-1">
                      {language === 'id' ? 'Lupa Password?' : 'Forgot Password?'}
                    </h1>
                    <p className="text-[#6C757D] text-[13px] mb-6 leading-relaxed">
                      {language === 'id'
                        ? 'Masukkan email terdaftar Anda. Kami akan mengirimkan 6 digit kode OTP.'
                        : 'Enter your registered email. We will send a 6-digit OTP verification code.'}
                    </p>
                    <form onSubmit={handleSendOtp} noValidate className="space-y-4">
                      <div>
                        <label htmlFor="forgot-email-mob" className="block text-[14px] font-semibold text-[#001734] mb-2">
                          {language === 'id' ? 'Alamat Email' : 'Email Address'}
                        </label>
                        <input
                          id="forgot-email-mob"
                          type="email"
                          placeholder="name@email.com"
                          value={forgotEmail}
                          onChange={e => { setForgotEmail(e.target.value); if (forgotEmailError) setForgotEmailError(validateForgotEmail(e.target.value)) }}
                          className={`w-full px-4 py-3 rounded-lg border text-[14px] text-[#001734] bg-white outline-none transition-all focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10 ${forgotEmailError ? 'border-red-400' : 'border-[#DEE2E6] hover:border-[#001734]/30'}`}
                        />
                        {forgotEmailError && <p className="mt-1.5 text-[12px] text-red-500">{forgotEmailError}</p>}
                      </div>
                      <button
                        type="submit"
                        disabled={forgotEmailLoading}
                        className={`w-full mt-2 py-3.5 rounded-lg font-semibold text-[15px] text-white transition-all ${forgotEmailLoading ? 'bg-[#001734]/60 cursor-not-allowed' : 'bg-[#001734] hover:bg-[#002C59] active:scale-[0.98]'}`}
                      >
                        {forgotEmailLoading ? (language === 'id' ? 'Mengirim OTP...' : 'Sending OTP...') : (language === 'id' ? 'Kirim OTP' : 'Send OTP')}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── STEP 2: OTP (MOBILE) ── */}
                {forgotStep === 'otp' && (
                  <div className="animate-fade-in">
                    <h1 className="text-[24px] font-bold text-[#001734] mb-1">
                      {language === 'id' ? 'Masukkan Kode OTP' : 'Enter OTP Code'}
                    </h1>
                    <p className="text-[#6C757D] text-[13px] mb-2 leading-relaxed">
                      {language === 'id' ? 'Kami mengirimkan kode 6 digit ke:' : 'We sent a 6-digit code to:'}
                    </p>
                    <p className="text-[13px] font-bold text-[#001734] mb-6 break-all">{forgotEmail}</p>

                    <form onSubmit={handleVerifyOtp} noValidate className="space-y-5">
                      <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                        {forgotOtp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => { otpRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className={`w-10 h-12 text-center text-[18px] font-bold rounded-lg border outline-none transition-all text-[#001734] bg-white
                              ${digit ? 'border-[#001734] bg-[#001734]/5' : 'border-[#DEE2E6]'}
                              focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/15
                              ${forgotOtpError ? 'border-red-400 bg-red-50/40' : ''}
                            `}
                          />
                        ))}
                      </div>
                      {forgotOtpError && <p className="text-[12px] text-red-500 text-center">{forgotOtpError}</p>}

                      <div className="text-center text-[13px] text-[#6B7F96]">
                        {canResend ? (
                          <button type="button" onClick={handleResendOtp} disabled={resendLoading} className="font-semibold text-[#001734] hover:underline">
                            {resendLoading ? (language === 'id' ? 'Mengirim ulang...' : 'Resending...') : (language === 'id' ? 'Kirim ulang OTP' : 'Resend OTP')}
                          </button>
                        ) : (
                          <span>
                            {language === 'id' ? 'Kirim ulang dalam ' : 'Resend code in '}
                            <span className="font-bold text-[#001734] tabular-nums">{countdown}s</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={forgotOtpLoading || forgotOtp.join('').length < 6}
                        className={`w-full py-3.5 rounded-lg font-semibold text-[15px] text-white transition-all ${forgotOtpLoading || forgotOtp.join('').length < 6 ? 'bg-[#001734]/40 cursor-not-allowed' : 'bg-[#001734] hover:bg-[#002C59] active:scale-[0.98]'}`}
                      >
                        {forgotOtpLoading ? (language === 'id' ? 'Memverifikasi...' : 'Verifying...') : (language === 'id' ? 'Verifikasi OTP' : 'Verify OTP')}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── STEP 3: NEW PASSWORD (MOBILE) ── */}
                {forgotStep === 'new-password' && (
                  <div className="animate-fade-in">
                    <h1 className="text-[24px] font-bold text-[#001734] mb-1">
                      {language === 'id' ? 'Buat Password Baru' : 'Create New Password'}
                    </h1>
                    <p className="text-[#6C757D] text-[13px] mb-6 leading-relaxed">
                      {language === 'id' ? 'Buat password baru yang kuat minimal 8 karakter.' : 'Create a strong new password with at least 8 characters.'}
                    </p>
                    <form onSubmit={handleResetPassword} noValidate className="space-y-4">
                      <div>
                        <label htmlFor="new-password-mob" className="block text-[14px] font-semibold text-[#001734] mb-2">
                          {language === 'id' ? 'Password Baru' : 'New Password'}
                        </label>
                        <div className="relative">
                          <input
                            id="new-password-mob"
                            type={showNew ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); if (newPasswordError) setNewPasswordError(validateNewPassword(e.target.value)); if (confirmPasswordError && confirmPassword) setConfirmPasswordError(e.target.value !== confirmPassword ? (language === 'id' ? 'Password tidak cocok.' : 'Passwords do not match.') : '') }}
                            className={`w-full px-4 py-3 pr-10 rounded-lg border text-[14px] text-[#001734] bg-white outline-none transition-all focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10 ${newPasswordError ? 'border-red-400' : 'border-[#DEE2E6] hover:border-[#001734]/30'}`}
                          />
                          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D] p-1">
                            <EyeIcon open={showNew} />
                          </button>
                        </div>
                        {newPasswordError && <p className="mt-1.5 text-[12px] text-red-500">{newPasswordError}</p>}
                        
                        {/* Password strength indicators */}
                        {newPassword && (
                          <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                              {[1,2,3,4].map(i => {
                                const strength = newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                                  : newPassword.length >= 10 && (/[A-Z]/.test(newPassword) || /[0-9]/.test(newPassword)) ? 3
                                  : newPassword.length >= 8 ? 2 : 1
                                return <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? (strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-yellow-400' : strength === 3 ? 'bg-blue-400' : 'bg-[#001734]') : 'bg-gray-200'}`} />
                              })}
                            </div>
                            <p className="text-[11px] text-[#8A9AB0]">
                              {(() => {
                                const s = newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                                  : newPassword.length >= 10 && (/[A-Z]/.test(newPassword) || /[0-9]/.test(newPassword)) ? 3
                                  : newPassword.length >= 8 ? 2 : 1
                                const labels = language === 'id'
                                  ? ['Terlalu lemah', 'Cukup kuat', 'Kuat', 'Sangat kuat']
                                  : ['Too weak', 'Fair', 'Strong', 'Very strong']
                                return labels[s - 1]
                              })()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirm-password-mob" className="block text-[14px] font-semibold text-[#001734] mb-2">
                          {language === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}
                        </label>
                        <div className="relative">
                          <input
                            id="confirm-password-mob"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); if (confirmPasswordError) setConfirmPasswordError(e.target.value !== newPassword ? (language === 'id' ? 'Password tidak cocok.' : 'Passwords do not match.') : '') }}
                            className={`w-full px-4 py-3 pr-10 rounded-lg border text-[14px] text-[#001734] bg-white outline-none transition-all focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10 ${confirmPasswordError ? 'border-red-400' : confirmPassword && confirmPassword === newPassword ? 'border-[#001734]' : 'border-[#DEE2E6] hover:border-[#001734]/30'}`}
                          />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D] p-1">
                            <EyeIcon open={showConfirm} />
                          </button>
                          {confirmPassword && confirmPassword === newPassword && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[#001734]">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                        </div>
                        {confirmPasswordError && <p className="mt-1.5 text-[12px] text-red-500">{confirmPasswordError}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className={`w-full mt-2 py-3.5 rounded-lg font-semibold text-[15px] text-white transition-all ${passwordLoading ? 'bg-[#001734]/60 cursor-not-allowed' : 'bg-[#001734] hover:bg-[#002C59] active:scale-[0.98]'}`}
                      >
                        {passwordLoading ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : (language === 'id' ? 'Simpan Password' : 'Save Password')}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── STEP 4: SUCCESS (MOBILE) ── */}
                {forgotStep === 'success' && (
                  <div className="text-center animate-fade-in py-4">
                    <div className="w-16 h-16 rounded-full bg-[#001734]/5 flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#001734]/15">
                      <svg className="w-8 h-8 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-[20px] font-bold text-[#001734] mb-2">
                      {language === 'id' ? 'Berhasil Diubah' : 'Password Updated'}
                    </h3>
                    <p className="text-[13px] text-[#6C757D] leading-relaxed mb-6">
                      {language === 'id' ? 'Password Anda berhasil diperbarui. Silakan login kembali.' : 'Your password has been successfully updated. Please log in again.'}
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 rounded-lg font-semibold text-[14px] bg-[#001734] text-white hover:bg-[#002C59] transition-all"
                    >
                      {language === 'id' ? 'Login Sekarang' : 'Login Now'}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ────────────────── SECTION 2: DESKTOP LAYOUT (>= lg) ────────────────── */}
          <div className="hidden lg:flex w-full h-full relative">
            
            {/* Visual Guide Left Side (Fixed 45% screen width) */}
            <div
              className="w-[45%] h-full relative flex flex-col justify-between p-12 overflow-hidden flex-shrink-0"
              style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-[#001734]/75" />

              {/* Desktop Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (forgotStep === 'otp') {
                        setForgotStep('email')
                      } else if (forgotStep === 'new-password') {
                        setForgotStep('otp')
                      } else {
                        navigate('/login')
                      }
                    }}
                    className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors group font-semibold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span className="text-[13px]">
                      {forgotStep === 'success' 
                        ? (language === 'id' ? 'Selesai' : 'Done') 
                        : (language === 'id' ? 'Kembali' : 'Back')}
                    </span>
                  </button>

                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 text-white/70 hover:text-white transition-all font-semibold"
                    aria-label="Toggle language"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest">{language}</span>
                  </button>
                </div>

                <Link to="/" className="text-white text-[22px] font-extrabold tracking-tight">
                  NextStep
                </Link>
              </div>

              {/* Progress Steps visually in left panel */}
              <div className="relative z-10 space-y-8 my-auto">
                <h1 className="text-white text-[32px] font-bold leading-tight">
                  {language === 'id' ? 'Reset password\ndengan mudah & aman.' : 'Reset your password\nsecurely.'}
                </h1>
                
                {/* Glassmorphism steps box */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl space-y-4 max-w-[360px]">
                  {steps.map((s, i) => (
                    <div key={s.key} className={`flex items-center gap-4 transition-all duration-300 ${i <= stepIndex ? 'opacity-100' : 'opacity-45'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 transition-all duration-300 ${
                        i < stepIndex
                          ? 'bg-[#001734] text-white border border-[#002C59] shadow-[0_0_12px_rgba(2,132,199,0.4)]'
                          : i === stepIndex
                            ? 'bg-white text-[#001734] shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                            : 'bg-white/15 text-white/50 border border-white/10'
                      }`}>
                        {i < stepIndex ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : i + 1}
                      </div>
                      <span className={`text-[15px] font-semibold ${i === stepIndex ? 'text-white' : 'text-white/60'}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 text-white/40 text-[12px]">
                © 2026 NextStep Capstone Project. All rights reserved.
              </div>
            </div>

            {/* Desktop Form Side (55% width) */}
            <div className="flex-1 h-full bg-white flex items-center justify-center px-12 lg:px-16 overflow-y-auto">
              
              {/* ── STEP 1: EMAIL (DESKTOP) ── */}
              {forgotStep === 'email' && (
                <div className="w-full max-w-[400px] animate-fade-up">
                  <div className="w-14 h-14 rounded-2xl bg-[#001734]/8 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h2 className="text-[28px] font-bold text-[#001734] mb-2">
                    {language === 'id' ? 'Lupa Password?' : 'Forgot Password?'}
                  </h2>
                  <p className="text-[14px] text-[#6B7F96] mb-8 leading-relaxed">
                    {language === 'id'
                      ? 'Masukkan email yang Anda gunakan saat mendaftar. Kami akan kirimkan kode OTP untuk verifikasi.'
                      : 'Enter the email you used to register. We\'ll send you a 6-digit OTP code to verify.'}
                  </p>

                  <form onSubmit={handleSendOtp} noValidate className="space-y-5">
                    <div>
                      <label htmlFor="forgot-email-desk" className="block text-[14px] font-semibold text-[#001734] mb-2">
                        {language === 'id' ? 'Alamat Email' : 'Email Address'}
                      </label>
                      <input
                        id="forgot-email-desk"
                        type="email"
                        placeholder="name@email.com"
                        value={forgotEmail}
                        onChange={e => { setForgotEmail(e.target.value); if (forgotEmailError) setForgotEmailError(validateForgotEmail(e.target.value)) }}
                        className={`w-full px-4 py-3 rounded-lg border text-[14px] text-[#001734] bg-white outline-none transition-all duration-200 focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10 ${forgotEmailError ? 'border-red-400' : 'border-[#DEE2E6] hover:border-[#001734]/30'}`}
                      />
                      {forgotEmailError && (
                        <p className="mt-1.5 text-[12px] text-red-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          {forgotEmailError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={forgotEmailLoading}
                      className={`w-full py-3.5 rounded-lg font-semibold text-[15px] text-white transition-all duration-300 ${forgotEmailLoading ? 'bg-[#001734]/60 cursor-not-allowed' : 'bg-[#001734] hover:bg-[#002C59] hover:shadow-lg active:scale-[0.98]'}`}
                    >
                      {forgotEmailLoading ? (language === 'id' ? 'Mengirim OTP...' : 'Sending OTP...') : (language === 'id' ? 'Kirim Kode OTP' : 'Send OTP Code')}
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 2: OTP (DESKTOP) ── */}
              {forgotStep === 'otp' && (
                <div className="w-full max-w-[400px] animate-fade-up">
                  <div className="w-14 h-14 rounded-2xl bg-[#001734]/8 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h2 className="text-[28px] font-bold text-[#001734] mb-2">
                    {language === 'id' ? 'Masukkan OTP' : 'Enter OTP'}
                  </h2>
                  <p className="text-[14px] text-[#6B7F96] mb-1">
                    {language === 'id' ? 'Kami mengirimkan kode 6 digit ke:' : 'We sent a 6-digit verification code to:'}
                  </p>
                  <p className="text-[14px] font-semibold text-[#001734] mb-8 break-all">{forgotEmail}</p>

                  <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
                    <div className="flex gap-2.5 justify-center" onPaste={handleOtpPaste}>
                      {forgotOtp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`w-11 h-14 text-center text-[20px] font-bold rounded-xl border-2 outline-none transition-all duration-200 text-[#001734] bg-white
                            ${digit ? 'border-[#001734] bg-[#001734]/5' : 'border-[#DEE2E6]'}
                            focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/15
                            ${forgotOtpError ? 'border-red-400 bg-red-50/40' : ''}
                          `}
                        />
                      ))}
                    </div>
                    {forgotOtpError && <p className="text-[12px] text-red-500 text-center">{forgotOtpError}</p>}

                    <div className="text-center text-[13px] text-[#6B7F96]">
                      {canResend ? (
                        <button type="button" onClick={handleResendOtp} disabled={resendLoading} className="font-semibold text-[#001734] hover:text-[#002C59] transition-colors disabled:opacity-50">
                          {resendLoading ? (language === 'id' ? 'Mengirim ulang...' : 'Resending...') : (language === 'id' ? 'Kirim ulang kode OTP' : 'Resend OTP code')}
                        </button>
                      ) : (
                        <span>
                          {language === 'id' ? 'Kirim ulang kode dalam ' : 'Resend code in '}
                          <span className="font-semibold text-[#001734] tabular-nums">{countdown}s</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={forgotOtpLoading || forgotOtp.join('').length < 6}
                      className={`w-full py-3.5 rounded-lg font-semibold text-[15px] text-white transition-all duration-300 ${forgotOtpLoading || forgotOtp.join('').length < 6 ? 'bg-[#001734]/40 cursor-not-allowed' : 'bg-[#001734] hover:bg-[#002C59] active:scale-[0.98]'}`}
                    >
                      {forgotOtpLoading ? (language === 'id' ? 'Memverifikasi...' : 'Verifying...') : (language === 'id' ? 'Verifikasi OTP' : 'Verify OTP')}
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 3: NEW PASSWORD (DESKTOP) ── */}
              {forgotStep === 'new-password' && (
                <div className="w-full max-w-[400px] animate-fade-up">
                  <div className="w-14 h-14 rounded-2xl bg-[#001734]/8 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </div>
                  <h2 className="text-[28px] font-bold text-[#001734] mb-2">
                    {language === 'id' ? 'Buat Password Baru' : 'Create New Password'}
                  </h2>
                  <p className="text-[14px] text-[#6B7F96] mb-8 leading-relaxed">
                    {language === 'id'
                      ? 'Buat password baru yang kuat minimal 8 karakter.'
                      : 'Create a strong new password with at least 8 characters.'}
                  </p>

                  <form onSubmit={handleResetPassword} noValidate className="space-y-5">
                    <div>
                      <label htmlFor="new-password-desk" className="block text-[14px] font-semibold text-[#001734] mb-2">
                        {language === 'id' ? 'Password Baru' : 'New Password'}
                      </label>
                      <div className="relative">
                        <input
                          id="new-password-desk"
                          type={showNew ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={e => { setNewPassword(e.target.value); if (newPasswordError) setNewPasswordError(validateNewPassword(e.target.value)); if (confirmPasswordError && confirmPassword) setConfirmPasswordError(e.target.value !== confirmPassword ? (language === 'id' ? 'Password tidak cocok.' : 'Passwords do not match.') : '') }}
                          className={`w-full px-4 py-3 pr-12 rounded-lg border text-[14px] text-[#001734] bg-white outline-none transition-all duration-200 focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10 ${newPasswordError ? 'border-red-400' : 'border-[#DEE2E6] hover:border-[#001734]/30'}`}
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] p-1">
                          <EyeIcon open={showNew} />
                        </button>
                      </div>
                      {newPasswordError && <p className="mt-1.5 text-[12px] text-red-500">{newPasswordError}</p>}

                      {/* Password strength indicators */}
                      {newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1,2,3,4].map(i => {
                              const strength = newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                                : newPassword.length >= 10 && (/[A-Z]/.test(newPassword) || /[0-9]/.test(newPassword)) ? 3
                                : newPassword.length >= 8 ? 2 : 1
                              return <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? (strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-yellow-400' : strength === 3 ? 'bg-blue-400' : 'bg-[#001734]') : 'bg-gray-200'}`} />
                            })}
                          </div>
                          <p className="text-[11px] text-[#8A9AB0]">
                            {(() => {
                              const s = newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                                : newPassword.length >= 10 && (/[A-Z]/.test(newPassword) || /[0-9]/.test(newPassword)) ? 3
                                : newPassword.length >= 8 ? 2 : 1
                              const labels = language === 'id'
                                ? ['Terlalu lemah', 'Cukup kuat', 'Kuat', 'Sangat kuat']
                                : ['Too weak', 'Fair', 'Strong', 'Very strong']
                              return labels[s - 1]
                            })()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirm-password-desk" className="block text-[14px] font-semibold text-[#001734] mb-2">
                        {language === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password-desk"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); if (confirmPasswordError) setConfirmPasswordError(e.target.value !== newPassword ? (language === 'id' ? 'Password tidak cocok.' : 'Passwords do not match.') : '') }}
                          className={`w-full px-4 py-3 pr-12 rounded-lg border text-[14px] text-[#001734] bg-white outline-none transition-all duration-200 focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10 ${confirmPasswordError ? 'border-red-400' : confirmPassword && confirmPassword === newPassword ? 'border-[#001734]' : 'border-[#DEE2E6] hover:border-[#001734]/30'}`}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] p-1">
                          <EyeIcon open={showConfirm} />
                        </button>
                        {confirmPassword && confirmPassword === newPassword && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[#001734]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </div>
                      {confirmPasswordError && <p className="mt-1.5 text-[12px] text-red-500">{confirmPasswordError}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className={`w-full py-3.5 rounded-lg font-semibold text-[15px] text-white transition-all duration-300 ${passwordLoading ? 'bg-[#001734]/60 cursor-not-allowed' : 'bg-[#001734] hover:bg-[#002C59] active:scale-[0.98]'}`}
                    >
                      {passwordLoading ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : (language === 'id' ? 'Simpan Password Baru' : 'Save New Password')}
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 4: SUCCESS (DESKTOP) ── */}
              {forgotStep === 'success' && (
                <div className="w-full max-w-[400px] text-center animate-fade-up">
                  <div className="w-20 h-20 rounded-full bg-[#001734]/5 flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#001734]/15">
                    <svg className="w-10 h-10 text-[#001734]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-[26px] font-bold text-[#001734] mb-3">
                    {language === 'id' ? 'Password Berhasil Diubah' : 'Password Updated'}
                  </h2>
                  <p className="text-[14px] text-[#6B7F96] leading-relaxed mb-8">
                    {language === 'id'
                      ? 'Password Anda sudah berhasil diperbarui. Silakan masuk dengan password baru Anda.'
                      : 'Your password has been successfully updated. Please log in with your new password.'}
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-semibold text-[15px] bg-[#001734] text-white hover:bg-[#002C59] hover:shadow-lg active:scale-[0.98] transition-all duration-300"
                  >
                    {language === 'id' ? 'Login Sekarang' : 'Login Now'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default AuthPage
