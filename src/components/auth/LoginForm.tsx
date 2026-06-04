import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

// Tipe data yang dikirim saat form berhasil disubmit
export interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void
  isLoading: boolean
  switchToRegister?: () => void
  switchToForgotPassword?: () => void
}

interface FormErrors {
  email: string
  password: string
}

const LoginForm = ({ onSubmit, isLoading, switchToRegister, switchToForgotPassword }: LoginFormProps) => {
  const { language } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' })
  const [touched, setTouched] = useState(false)

  // Validasi email format
  const validateEmail = (value: string): string => {
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

  // Validasi password
  const validatePassword = (value: string): string => {
    if (!value) {
      return language === 'id' ? 'Password wajib diisi.' : 'Password is required.'
    }
    if (value.length < 8) {
      return language === 'id' ? 'Password minimal 8 karakter.' : 'Password must be at least 8 characters.'
    }
    return ''
  }

  // Validasi seluruh form
  const validateForm = (): boolean => {
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    setErrors({ email: emailError, password: passwordError })
    return !emailError && !passwordError
  }

  // Handle submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(true)

    if (!validateForm()) return

    // Sanitasi: trim email, kirim data
    const sanitizedData: LoginFormData = {
      email: email.trim().toLowerCase(),
      password: password,
    }

    onSubmit(sanitizedData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full space-y-6"
      aria-label="Login form"
    >
      {/* Email Field */}
      <div>
        <label
          htmlFor="login-email"
          className="block text-[14px] font-semibold text-[#001734] mb-2"
        >
          {language === 'id' ? 'Alamat Email' : 'Email Address'}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (touched) {
              setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }))
            }
          }}
          className={`
            w-full px-4 py-3 rounded-lg border text-[14px] text-[#001734]
            placeholder:text-[#ADB5BD] bg-white
            outline-none transition-all duration-200
            focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10
            ${touched && errors.email ? 'border-red-400' : 'border-[#DEE2E6]'}
          `}
          aria-invalid={touched && !!errors.email}
          aria-describedby={touched && errors.email ? 'login-email-error' : undefined}
        />
        {touched && errors.email && (
          <p id="login-email-error" className="mt-1.5 text-[12px] text-red-500" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="login-password"
            className="block text-[14px] font-semibold text-[#001734]"
          >
            Password
          </label>
          {switchToForgotPassword ? (
            <button
              type="button"
              onClick={switchToForgotPassword}
              className="text-[13px] font-medium text-[#001734] hover:text-[#002C59] transition-colors cursor-pointer"
            >
              {language === 'id' ? 'Lupa Password?' : 'Forgot Password?'}
            </button>
          ) : (
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-[#001734] hover:text-[#002C59] transition-colors"
            >
              {language === 'id' ? 'Lupa Password?' : 'Forgot Password?'}
            </Link>
          )}
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (touched) {
                setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }))
              }
            }}
            className={`
              w-full px-4 py-3 pr-12 rounded-lg border text-[14px] text-[#001734]
              placeholder:text-[#ADB5BD] bg-white
              outline-none transition-all duration-200
              focus:border-[#001734] focus:ring-2 focus:ring-[#001734]/10
              ${touched && errors.password ? 'border-red-400' : 'border-[#DEE2E6]'}
            `}
            aria-invalid={touched && !!errors.password}
            aria-describedby={touched && errors.password ? 'login-password-error' : undefined}
          />
          {/* Toggle Show/Hide Password */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#001734] transition-colors p-1"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? (
              // Eye-off icon
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              // Eye icon
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
        {touched && errors.password && (
          <p id="login-password-error" className="mt-1.5 text-[12px] text-red-500" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-3.5 rounded-lg font-semibold text-[15px] text-white
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
          language === 'id' ? 'Masuk' : 'Login'
        )}
      </button>

      {/* Register Link */}
      <p className="text-center text-[14px] text-[#495057]">
        {language === 'id' ? 'Belum punya akun? ' : "Don't have an account? "}
        {switchToRegister ? (
          <button
            type="button"
            onClick={switchToRegister}
            className="font-bold text-[#001734] hover:text-[#002C59] transition-colors"
          >
            {language === 'id' ? 'Daftar sekarang' : 'Register now'}
          </button>
        ) : (
          <Link
            to="/register"
            className="font-bold text-[#001734] hover:text-[#002C59] transition-colors"
          >
            {language === 'id' ? 'Daftar sekarang' : 'Register now'}
          </Link>
        )}
      </p>
    </form>
  )
}

export default LoginForm
