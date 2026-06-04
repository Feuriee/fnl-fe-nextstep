import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export interface RegisterFormData {
  fullName: string
  email: string
  password: string
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void
  isLoading: boolean
  switchToLogin?: () => void
}

interface FormErrors {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterForm = ({ onSubmit, isLoading, switchToLogin }: RegisterFormProps) => {
  const { language } = useLanguage()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState(false)

  const validateFullName = (value: string) => {
    if (!value.trim()) {
      return language === 'id' ? 'Nama lengkap wajib diisi.' : 'Full name is required.'
    }
    return ''
  }

  const validateEmail = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return language === 'id' ? 'Email wajib diisi.' : 'Email is required.'
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(trimmed)) {
      return language === 'id' ? 'Format email tidak valid.' : 'Invalid email format.'
    }
    return ''
  }

  const validatePassword = (value: string) => {
    if (!value) {
      return language === 'id' ? 'Password wajib diisi.' : 'Password is required.'
    }
    if (value.length < 8) {
      return language === 'id' ? 'Password minimal 8 karakter.' : 'Password must be at least 8 characters.'
    }
    return ''
  }

  const validateConfirmPassword = (value: string, pass: string) => {
    if (!value) {
      return language === 'id' ? 'Konfirmasi password wajib diisi.' : 'Confirm password is required.'
    }
    if (value !== pass) {
      return language === 'id' ? 'Password tidak cocok.' : 'Passwords do not match.'
    }
    return ''
  }

  const validateForm = (): boolean => {
    const nameError = validateFullName(fullName)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmError = validateConfirmPassword(confirmPassword, password)

    setErrors({
      fullName: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError
    })

    return !nameError && !emailError && !passwordError && !confirmError
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(true)

    if (!validateForm()) return

    const sanitizedData: RegisterFormData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
    }

    onSubmit(sanitizedData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full space-y-5"
      aria-label="Register form"
    >
      {/* Full Name Field */}
      <div>
        <label htmlFor="reg-name" className="block text-[13px] font-semibold text-[#001734] mb-1.5">
          {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          placeholder={language === 'id' ? 'Jokowi Widodo' : 'e.g. Joko Widodo'}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            if (touched) setErrors(prev => ({ ...prev, fullName: validateFullName(e.target.value) }))
          }}
          className={`
            w-full px-4 py-2.5 rounded-lg border text-[14px] text-[#001734]
            placeholder:text-[#ADB5BD] bg-white outline-none transition-all duration-200
            focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10
            ${touched && errors.fullName ? 'border-red-400' : 'border-[#DEE2E6]'}
          `}
          aria-invalid={touched && !!errors.fullName}
        />
        {touched && errors.fullName && <p className="mt-1 text-[12px] text-red-500">{errors.fullName}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="reg-email" className="block text-[13px] font-semibold text-[#001734] mb-1.5">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (touched) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }))
          }}
          className={`
            w-full px-4 py-2.5 rounded-lg border text-[14px] text-[#001734]
            placeholder:text-[#ADB5BD] bg-white outline-none transition-all duration-200
            focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10
            ${touched && errors.email ? 'border-red-400' : 'border-[#DEE2E6]'}
          `}
          aria-invalid={touched && !!errors.email}
        />
        {touched && errors.email && <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="reg-password" className="block text-[13px] font-semibold text-[#001734] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (touched) {
                setErrors(prev => ({
                  ...prev,
                  password: validatePassword(e.target.value),
                  confirmPassword: confirmPassword ? validateConfirmPassword(confirmPassword, e.target.value) : prev.confirmPassword
                }))
              }
            }}
            className={`
              w-full px-4 py-2.5 pr-12 rounded-lg border text-[14px] text-[#001734]
              placeholder:text-[#ADB5BD] bg-white outline-none transition-all duration-200
              focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10
              ${touched && errors.password ? 'border-red-400' : 'border-[#DEE2E6]'}
            `}
            aria-invalid={touched && !!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#001734] transition-colors p-1"
          >
            {showPassword ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
          </button>
        </div>
        {touched && errors.password && <p className="mt-1 text-[12px] text-red-500">{errors.password}</p>}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="reg-confirm-password" className="block text-[13px] font-semibold text-[#001734] mb-1.5">
          {language === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}
        </label>
        <div className="relative">
          <input
            id="reg-confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (touched) setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(e.target.value, password) }))
            }}
            className={`
              w-full px-4 py-2.5 pr-12 rounded-lg border text-[14px] text-[#001734]
              placeholder:text-[#ADB5BD] bg-white outline-none transition-all duration-200
              focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10
              ${touched && errors.confirmPassword ? 'border-red-400' : 'border-[#DEE2E6]'}
            `}
            aria-invalid={touched && !!errors.confirmPassword}
          />
        </div>
        {touched && errors.confirmPassword && <p className="mt-1 text-[12px] text-red-500">{errors.confirmPassword}</p>}
      </div>

      {/* Register Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full mt-2 py-3.5 rounded-lg font-semibold text-[15px] text-white
          transition-all duration-300
          ${isLoading
            ? 'bg-[#001734]/70 cursor-not-allowed'
            : 'bg-[#001734] hover:bg-[#002C59] hover:shadow-lg hover:shadow-[#00173420] active:scale-[0.98]'
          }
        `}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {language === 'id' ? 'Memproses...' : 'Processing...'}
          </span>
        ) : (
          language === 'id' ? 'Daftar' : 'Register'
        )}
      </button>

      {/* Login Link */}
      <p className="text-center text-[14px] text-[#495057] mt-4">
        {language === 'id' ? 'Sudah punya akun? ' : 'Already have an account? '}
        {switchToLogin ? (
          <button
            type="button"
            onClick={switchToLogin}
            className="font-bold text-[#001734] hover:text-[#002C59] transition-colors"
          >
            Login
          </button>
        ) : (
          <Link
            to="/login"
            className="font-bold text-[#001734] hover:text-[#002C59] transition-colors"
          >
            Login
          </Link>
        )}
      </p>
    </form>
  )
}

export default RegisterForm
