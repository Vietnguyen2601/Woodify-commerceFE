import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ADMIN_ACCOUNT = {
  email: 'admin@woodmarket.com',
  password: 'Admin#2026',
  name: 'Head of Operations'
}

const CUSTOMER_ACCOUNT = {
  email: 'customer@woodmarket.com',
  password: 'Customer#2026',
  name: 'Premium Member'
}

const STRENGTH_PALETTE = [
  { label: 'Rất yếu', color: '#C84545' },
  { label: 'Trung bình', color: '#E6A151' },
  { label: 'Mạnh', color: '#6EA36E' },
]

function evaluateStrength(value: string) {
  if (!value) return { level: 0, percent: '0%' }
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  const clamped = Math.min(Math.max(score - 1, 0), 2)
  const percent = `${((clamped + 1) / 3) * 100}%`
  return { level: clamped, percent }
}

const AuthHero: React.FC = () => (
  <div className='auth-hero' aria-hidden='true'>
    <div>
      <div className='auth-logo'>
        <span>WM</span>
        WoodMarket
      </div>
      <h1>Đăng nhập để tiếp tục khám phá gỗ tinh tuyển</h1>
      <p>
        Tận hưởng không gian mua sắm ấm áp, chọn lựa sản phẩm thủ công bền vững và quản lý đơn hàng
        chỉ trong vài thao tác.
      </p>
    </div>
    <div>
      <p className='auth-subtitle'>An tâm với bảo mật nhiều lớp, OTP và chính sách quyền riêng tư minh bạch.</p>
    </div>
  </div>
)

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formState, setFormState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [bannerMessage, setBannerMessage] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const strength = useMemo(() => evaluateStrength(password), [password])
  const strengthMeta = STRENGTH_PALETTE[strength.level]

  function validate() {
    const nextErrors: { email?: string; password?: string } = {}
    if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = 'Email không hợp lệ'
    }
    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) {
      setFormState('error')
      setBannerMessage('Sai email hoặc mật khẩu. Quên mật khẩu?')
      return
    }

    setFormState('loading')
    setBannerMessage('')

    window.setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase()
      const isAdminAccount =
        normalizedEmail === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password

      localStorage.setItem('auth_token', 'mock-token')
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true')
      } else {
        localStorage.removeItem('remember_me')
      }

      localStorage.setItem('user_role', isAdminAccount ? 'admin' : 'user')
      if (isAdminAccount) {
        localStorage.setItem(
          'admin_profile',
          JSON.stringify({
            name: ADMIN_ACCOUNT.name,
            lastLogin: new Date().toISOString()
          })
        )
      } else {
        localStorage.removeItem('admin_profile')
      }

      nav(isAdminAccount ? '/admin' : '/')
      setFormState('idle')
    }, 750)
  }

  function handlePrefillAdmin() {
    setEmail(ADMIN_ACCOUNT.email)
    setPassword(ADMIN_ACCOUNT.password)
    setErrors({})
    setFormState('idle')
  }

  function handlePrefillCustomer() {
    setEmail(CUSTOMER_ACCOUNT.email)
    setPassword(CUSTOMER_ACCOUNT.password)
    setErrors({})
    setFormState('idle')
  }

  return (
    <div className='auth-shell'>
      <div className='auth-layer'>
        <AuthHero />

        <section className='auth-card' role='form' aria-live='polite'>
          <div>
            <h2>Đăng nhập</h2>
            <p className='auth-subtitle'>Chào mừng trở lại với WoodMarket</p>
          </div>

          {formState === 'error' && bannerMessage && <div className='auth-alert'>{bannerMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className='auth-form-group'>
              <label className='auth-label' htmlFor='login-email'>
                Email của bạn
              </label>
              <input
                id='login-email'
                type='email'
                inputMode='email'
                className='auth-input'
                placeholder='ví dụ: minh@domain.com'
                value={email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
              />
              {errors.email && (
                <span id='login-email-error' className='auth-error-text' role='status'>
                  {errors.email}
                </span>
              )}
            </div>

            <div className='auth-form-group'>
              <label className='auth-label' htmlFor='login-password'>
                Mật khẩu
              </label>
              <div className='password-field'>
                <input
                  id='login-password'
                  type={showPassword ? 'text' : 'password'}
                  className='auth-input'
                  placeholder='Nhập mật khẩu'
                  value={password}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                />
                <button
                  type='button'
                  className='password-toggle'
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              {errors.password && (
                <span id='login-password-error' className='auth-error-text' role='status'>
                  {errors.password}
                </span>
              )}
              <div className='strength-meter' aria-live='polite'>
                <div className='strength-bar'>
                  <span style={{ width: strength.percent, background: strengthMeta?.color }} />
                </div>
                <span className='strength-label' style={{ color: strengthMeta?.color }}>
                  {password ? strengthMeta?.label : 'Nhập mật khẩu'}
                </span>
              </div>
            </div>

            <div className='auth-inline'>
              <label className='auth-checkbox'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Ghi nhớ tôi
              </label>
              <Link to='/forgot-password' className='auth-link'>
                Quên mật khẩu?
              </Link>
            </div>

            <div className='auth-sample-card'>
              <div>
                <p className='auth-sample-card__title'>Tài khoản Admin mẫu</p>
                <p className='auth-sample-card__meta'>Email: {ADMIN_ACCOUNT.email}</p>
                <p className='auth-sample-card__meta'>Mật khẩu: {ADMIN_ACCOUNT.password}</p>
              </div>
              <button type='button' onClick={handlePrefillAdmin} className='auth-btn tertiary'>
                Điền nhanh
              </button>
            </div>

            <div className='auth-sample-card'>
              <div>
                <p className='auth-sample-card__title'>Tài khoản Khách hàng mẫu</p>
                <p className='auth-sample-card__meta'>Email: {CUSTOMER_ACCOUNT.email}</p>
                <p className='auth-sample-card__meta'>Mật khẩu: {CUSTOMER_ACCOUNT.password}</p>
              </div>
              <button type='button' onClick={handlePrefillCustomer} className='auth-btn tertiary'>
                Điền nhanh
              </button>
            </div>

            <button className='auth-btn primary' type='submit' disabled={formState === 'loading'}>
              {formState === 'loading' ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <button className='auth-btn secondary social-btn' type='button'>
            <svg viewBox='0 0 24 24' role='img' aria-hidden='true'>
              <path
                fill='currentColor'
                d='M21.6 12.227c0-.815-.073-1.6-.21-2.355H12v4.45h5.4a4.61 4.61 0 01-2 3.023v2.502h3.23c1.893-1.742 2.97-4.309 2.97-7.62z'
              />
              <path
                fill='currentColor'
                d='M12 22c2.7 0 4.96-.897 6.613-2.43l-3.228-2.502c-.897.6-2.045.955-3.385.955-2.606 0-4.815-1.76-5.602-4.117H3.05v2.59A10 10 0 0012 22z'
              />
              <path
                fill='currentColor'
                d='M6.398 13.906A6.01 6.01 0 016.086 12c0-.66.114-1.298.312-1.906V7.504H3.05A10 10 0 002 12c0 1.62.388 3.147 1.05 4.496l3.348-2.59z'
              />
              <path
                fill='currentColor'
                d='M12 6.25a5.427 5.427 0 013.84 1.5l2.88-2.88C17 2.99 14.7 2 12 2A10 10 0 003.05 7.504l3.348 2.59C7.184 7.737 9.393 6.25 12 6.25z'
              />
            </svg>
            Đăng nhập với Google
          </button>

          <p className='auth-subtitle'>
            Bạn chưa có tài khoản? <Link to='/register' className='auth-link'>Đăng ký</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
