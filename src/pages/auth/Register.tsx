import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/services'
import woodifyLogo from '../../assets/logo/Woodify.jpg'
import '../../styles/auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_LENGTH = 6
const MAX_RESEND = 5
const PHONE_PATTERN = /^\d{9,11}$/

const passwordChecks = (value: string) => ({
  length: value.length >= 8,
  casing: /[A-Z]/.test(value) && /[a-z]/.test(value),
  number: /\d/.test(value),
  special: /[^A-Za-z0-9]/.test(value),
})

const EyeIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
    <path
      d='M1.5 12s3.75-6.5 10.5-6.5 10.5 6.5 10.5 6.5-3.75 6.5-10.5 6.5S1.5 12 1.5 12z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='1.5' />
  </svg>
)

const EyeOffIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
    <path
      d='M1.5 12s3.75-6.5 10.5-6.5 10.5 6.5 10.5 6.5-3.75 6.5-10.5 6.5S1.5 12 1.5 12z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='1.5' />
    <path d='M4 4l16 16' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
  </svg>
)

const AuthHero: React.FC = () => (
  <div className='auth-hero' aria-hidden='true'>
    <div className='auth-logo'>WOODIFY</div>
    <div className='auth-hero-logo'>
      <img src={woodifyLogo} alt='Logo Woodify' loading='lazy' />
    </div>
    <div className='auth-hero-text'>
      <h1>Chào mừng nghệ nhân và người yêu gỗ</h1>
      <p>
        Tạo tài khoản để nhận ưu đãi độc quyền, quản lý đơn hàng nhanh chóng và kết nối cùng cộng đồng
        yêu gỗ thủ công.
      </p>
    </div>
  </div>
)

export default function Register() {
  const nav = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailExists, setEmailExists] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])
  const [otpError, setOtpError] = useState('')
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [timer, setTimer] = useState(60)
  const [resendCount, setResendCount] = useState(0)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [registerState, setRegisterState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [showTermsError, setShowTermsError] = useState(false)
  const [isChecklistOpen, setIsChecklistOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (step !== 2 || timer <= 0) return
    const id = window.setTimeout(() => setTimer((prev) => prev - 1), 1000)
    return () => window.clearTimeout(id)
  }, [step, timer])

  useEffect(() => {
    if (step === 2) {
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setOtpError('')
      setOtpAttempts(0)
      setTimer(60)
      window.setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 120)
    }
  }, [step])

  useEffect(() => {
    if (step !== 4) return
    const redirectId = window.setTimeout(() => {
      nav('/')
    }, 2000)
    return () => window.clearTimeout(redirectId)
  }, [step, nav])

  const maskedEmail = useMemo(() => {
    if (!email) return ''
    const [name, domain] = email.split('@')
    if (!domain) return email
    const safeName = name.length <= 2 ? `${name[0] || ''}***` : `${name.slice(0, 2)}***`
    return `${safeName}@${domain}`
  }, [email])

  const passwordState = useMemo(() => passwordChecks(password), [password])
  const strengthCount = Object.values(passwordState).filter(Boolean).length
  const normalizedStrength = Math.min(Math.max(strengthCount, 0), 3)
  const strengthPalette = ['#C84545', '#E6A151', '#6EA36E']
  const strengthIndex = Math.max(normalizedStrength - 1, 0)
  const strengthLabel = ['Yếu', 'Trung bình', 'Mạnh'][strengthIndex]
  const trimmedUsername = useMemo(() => username.trim(), [username])
  const normalizedPhone = useMemo(() => phone.replace(/\D/g, ''), [phone])
  const isUsernameValid = trimmedUsername.length >= 3
  const isPhoneValid = PHONE_PATTERN.test(normalizedPhone)

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError('Email không hợp lệ')
      return
    }
    setEmailError('')
    setIsSendingCode(true)
    
    // Fake wait: jump to step 2 after 1 second without waiting for API
    window.setTimeout(() => {
      setIsSendingCode(false)
      setEmailExists(false)
      setStep(2)
    }, 1000)
    
    // Call API in background (don't wait for it)
    import('@/services/auth.service').then(({ authService }) => {
      authService.sendOtp({ email })
        .catch((err) => {
          const errorMessage = err?.message || 'Không gửi được mã xác minh. Vui lòng thử lại.'
          console.error('Send OTP error:', errorMessage)
          
          if (errorMessage.toLowerCase().includes('exists')) {
            setEmailError('Email đã đăng ký — Đăng nhập hoặc gửi lại mật khẩu')
            setEmailExists(true)
            setStep(1)
          } else {
            console.warn('OTP sent but API failed. User can retry from OTP screen.')
          }
        })
    })
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    if (emailError) setEmailError('')
    if (emailExists) setEmailExists(false)
  }

  function handleOtpChange(index: number, value: string) {
    if (/^\d{6}$/.test(value)) {
      const arr = value.split('')
      setOtpDigits(arr)
      otpRefs.current[OTP_LENGTH - 1]?.focus()
      return
    }
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevIndex = index - 1
      otpRefs.current[prevIndex]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus()
  }

  function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otpDigits.some((digit) => !digit)) {
      setOtpError('Vui lòng nhập đủ mã xác minh')
      return
    }
    const code = otpDigits.join('')
    setOtpError('')
    setOtpAttempts(0)
    // Gọi API verify-otp
    import('@/services/auth.service').then(({ authService }) => {
      authService.verifyOtp({ email, otp: code })
        .then((res: any) => {
          console.log('[verify-otp] response:', JSON.stringify(res))
          if (res.data?.success || res.status === 200) {
            setStep(3)
          } else {
            setOtpError('Mã xác minh không đúng. Vui lòng thử lại.')
            setOtpAttempts((prev) => prev + 1)
          }
        })
        .catch((err) => {
          setOtpError(err?.message || 'Mã xác minh không đúng hoặc đã hết hạn.')
          setOtpAttempts((prev) => prev + 1)
        })
    })
  }

  function handleResend() {
    if (timer > 0 || resendCount >= MAX_RESEND) return
    setResendCount((prev) => prev + 1)
    setTimer(60)
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    setOtpError('Mã mới đã được gửi. Vui lòng kiểm tra hộp thư.')
    otpRefs.current[0]?.focus()
  }

  const formattedTimer = `00:${String(Math.max(timer, 0)).padStart(2, '0')}`

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const snapshot = passwordChecks(password)
    const meetsBasics = snapshot.length && snapshot.casing && snapshot.number
    if (!meetsBasics) return
    if (password !== confirmPassword) return
    let hasDetailsError = false
    if (!isUsernameValid) {
      setUsernameError('Tên người dùng tối thiểu 3 ký tự')
      hasDetailsError = true
    } else {
      setUsernameError('')
    }
    if (!isPhoneValid) {
      setPhoneError('Số điện thoại cần 9-11 chữ số')
      hasDetailsError = true
    } else {
      setPhoneError('')
    }
    if (hasDetailsError) return
    if (!acceptTerms) {
      setShowTermsError(true)
      return
    }
    setShowTermsError(false)
    setRegisterState('loading')
    const username = email.split('@')[0]
    import('@/services/auth.service').then(({ authService }) => {
      authService.registerWithOtp({
        email,
        password,
        confirmPassword,
        username,
      })
        .then((res: any) => {
          if (res.data?.success || res.status === 200) {
            // Auto-login: store token & user data
            if (res.data?.token) {
              localStorage.setItem('auth_token', res.data.token)
            }
            if (res.data?.refreshToken) {
              localStorage.setItem('refresh_token', res.data.refreshToken)
            }
            localStorage.setItem('user_email', email)
            localStorage.setItem('user_name', res.data?.username || username)
            localStorage.setItem('user_role', 'user')

            // Update React Query cache so Header shows username
            queryClient.setQueryData(queryKeys.user(), {
              accountId: res.data?.accountId || '',
              email,
              username: res.data?.username || username,
            })

            setRegisterState('success')
            setStep(4)
          } else {
            setRegisterState('idle')
          }
        })
        .catch((err) => {
          setRegisterState('idle')
        })
    })
  }

  function goShopping() {
    nav('/')
  }

  const checklist = [
    { key: 'length', label: 'Ít nhất 8 ký tự' },
    { key: 'casing', label: 'Có chữ hoa và chữ thường' },
    { key: 'number', label: 'Bao gồm chữ số' },
    { key: 'special', label: 'Ký tự đặc biệt (khuyến nghị)' },
  ] as const

  const strengthColor = strengthPalette[strengthIndex]
  const canSubmitPassword =
    password &&
    confirmPassword &&
    password === confirmPassword &&
    acceptTerms &&
    normalizedStrength >= 3 &&
    isUsernameValid &&
    isPhoneValid

  const resendLimitReached = resendCount >= MAX_RESEND

  return (
    <>
      <div className='auth-shell'>
        <div className='auth-layer'>
        <AuthHero />

        <section className='auth-card'>
          <div>
            <h2>Đăng ký tài khoản</h2>
            <p className='auth-subtitle'>Hoàn tất trong 3 bước, bảo mật OTP</p>
          </div>

          <div className='stepper' aria-hidden='true'>
            {[1, 2, 3].map((dot) => (
              <span key={dot} className={`step-dot ${step >= dot ? 'active' : ''}`} />
            ))}
          </div>

          <div className='step-wrapper'>
            {step === 1 && (
              <div className='step-panel' key='step-1'>
                <form onSubmit={handleEmailSubmit} noValidate>
                  <div className='auth-form-group'>
                    <label className='auth-label' htmlFor='register-email'>
                      Email
                    </label>
                    <input
                      id='register-email'
                      type='email'
                      className='auth-input'
                      placeholder='ví dụ: minh@domain.com'
                      value={email}
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={emailError ? 'register-email-error' : undefined}
                      onChange={(event) => handleEmailChange(event.target.value)}
                    />
                    {emailError && (
                      <span id='register-email-error' className='auth-error-text' role='status'>
                        {emailError}
                      </span>
                    )}
                  </div>

                  <button className='auth-btn primary' type='submit' disabled={isSendingCode}>
                    {isSendingCode ? 'Đang gửi mã...' : 'Gửi mã xác minh'}
                  </button>
                </form>

                {emailExists && (
                  <div className='auth-inline' style={{ marginTop: 16 }}>
                    <span className='auth-subtitle'>Email đã đăng ký</span>
                    <Link to='/login' className='auth-link'>
                      Đăng nhập
                    </Link>
                    <Link to='/forgot-password' className='auth-link'>
                      Gửi lại mật khẩu
                    </Link>
                  </div>
                )}

                <p className='auth-subtitle' style={{ marginTop: 20 }}>
                  Đã có tài khoản? <Link to='/login' className='auth-link'>Đăng nhập</Link>
                </p>
              </div>
            )}

            {step === 2 && (
              <div className='step-panel' key='step-2'>
                <form onSubmit={handleVerifyCode}>
                  <h3>Nhập mã xác minh</h3>
                  <p className='auth-subtitle'>Mã 6 chữ số đã gửi tới {maskedEmail}</p>

                  <div className='otp-group' role='group' aria-label='Mã xác minh 6 chữ số'>
                    {otpDigits.map((value, index) => (
                      <input
                        key={index}
                        ref={(element) => { otpRefs.current[index] = element }}
                        className='otp-input'
                        inputMode='numeric'
                        maxLength={1}
                        pattern='[0-9]'
                        value={value}
                        aria-label={`Ký tự thứ ${index + 1}`}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={(event) => {
                          const pasted = event.clipboardData.getData('text')
                          if (/^\d{6}$/.test(pasted)) {
                            setOtpDigits(pasted.split(''))
                            otpRefs.current[OTP_LENGTH - 1]?.focus()
                            event.preventDefault()
                          }
                        }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className='auth-error-text' role='status' style={{ marginTop: 10 }}>
                      {otpError}
                    </p>
                  )}

                  <div className='auth-inline' style={{ marginTop: 16 }}>
                    <span className='timer-label'>
                      {timer > 0 ? `Gửi lại trong ${formattedTimer}` : 'Có thể gửi lại mã'}
                    </span>
                    <button
                      type='button'
                      className='auth-link'
                      onClick={handleResend}
                      disabled={timer > 0 || resendLimitReached}
                      style={{ border: 'none', background: 'transparent', padding: 0 }}
                    >
                      {resendLimitReached ? 'Đã đạt giới hạn' : 'Gửi lại mã'}
                    </button>
                  </div>

                  <button className='auth-btn primary' type='submit'>
                    Xác minh &amp; tiếp tục
                  </button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className='step-panel' key='step-3'>
                <form onSubmit={handleRegister}>
                  <div className='password-section-header'>
                    <h3>Tạo mật khẩu</h3>
                    <div className='password-info-wrapper'>
                      <button
                        type='button'
                        className={`password-info-trigger ${isChecklistOpen ? 'active' : ''}`}
                        aria-label={`${isChecklistOpen ? 'Ẩn' : 'Hiển thị'} checklist mật khẩu`}
                        aria-pressed={isChecklistOpen}
                        aria-controls='password-checklist'
                        onClick={() => setIsChecklistOpen((prev) => !prev)}
                      >
                        !
                      </button>
                    </div>
                  </div>

                  <div className='auth-form-group'>
                    <label className='auth-label' htmlFor='register-username'>
                      Tên người dùng
                    </label>
                    <input
                      id='register-username'
                      type='text'
                      className='auth-input'
                      placeholder='Ví dụ: woodlover90'
                      value={username}
                      autoComplete='username'
                      aria-invalid={Boolean(usernameError)}
                      aria-describedby={usernameError ? 'register-username-error' : undefined}
                      onChange={(event) => {
                        setUsername(event.target.value)
                        if (usernameError) setUsernameError('')
                      }}
                    />
                    {usernameError && (
                      <span id='register-username-error' className='auth-error-text'>
                        {usernameError}
                      </span>
                    )}
                  </div>

                  <div className='auth-form-group'>
                    <label className='auth-label' htmlFor='register-phone'>
                      Số điện thoại
                    </label>
                    <input
                      id='register-phone'
                      type='tel'
                      className='auth-input'
                      placeholder='09xx xxx xxx'
                      value={phone}
                      inputMode='tel'
                      aria-invalid={Boolean(phoneError)}
                      aria-describedby={phoneError ? 'register-phone-error' : undefined}
                      onChange={(event) => {
                        setPhone(event.target.value)
                        if (phoneError) setPhoneError('')
                      }}
                    />
                    {phoneError && (
                      <span id='register-phone-error' className='auth-error-text'>
                        {phoneError}
                      </span>
                    )}
                  </div>

                  <div className='auth-form-group'>
                    <label className='auth-label' htmlFor='register-password'>
                      Mật khẩu
                    </label>
                    <input
                      id='register-password'
                      type='password'
                      className='auth-input'
                      placeholder='Tạo mật khẩu (ít nhất 8 ký tự)'
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />

                  </div>

                  <div className='password-row'>
                    <div className='auth-form-group'>
                      <label className='auth-label' htmlFor='register-password-confirm'>
                        Xác nhận mật khẩu
                      </label>
                      <input
                        id='register-password-confirm'
                        type='password'
                        className='auth-input'
                        placeholder='Nhập lại mật khẩu'
                        value={confirmPassword}
                        aria-invalid={Boolean(confirmPassword) && confirmPassword !== password}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                      {confirmPassword && confirmPassword !== password && (
                        <span className='auth-error-text'>Mật khẩu và xác nhận không khớp</span>
                      )}
                    </div>

                    {isChecklistOpen && (
                      <div className='password-checklist' id='password-checklist' aria-live='polite'>
                        {checklist.map((item) => (
                          <span key={item.key} style={{ color: passwordState[item.key] ? '#2B2B2B' : '#A5A1A0' }}>
                            {passwordState[item.key] ? '✓' : '•'} {item.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className='auth-remember-row'>
                    <label className="auth-checkbox">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(event) => {
                          setAcceptTerms(event.target.checked);
                          if (event.target.checked) setShowTermsError(false);
                        }}
                      />
                    </label>
                    <span className="auth-checkbox-text">
                        Tôi đồng ý với{' '}
                        <a className="auth-link" href="/terms">Điều khoản</a>{' '}
                        &amp;{' '}
                        <a className="auth-link" href="/privacy">Chính sách Bảo mật</a>
                    </span>
                  </div>
                  

                  {showTermsError && !acceptTerms && (
                    <span className="auth-error-text">Vui lòng đồng ý Điều khoản</span>
                  )}

                  <button className='auth-btn primary' type='submit' disabled={!canSubmitPassword || registerState === 'loading'}>
                    {registerState === 'loading' ? 'Đang hoàn tất...' : 'Hoàn tất đăng ký'}
                  </button>
                </form>
              </div>
            )}

            {step === 4 && (
              <div className='step-panel success-card' key='step-4'>
                <h3>Chào mừng đến với Woodify</h3>
                <p>Đăng ký thành công. Chúng tôi đã tự động đăng nhập để bạn bắt đầu mua sắm ngay.</p>
                <p className='auth-subtitle'>Gợi ý: hoàn thiện hồ sơ để nhận khuyến mãi cá nhân hóa.</p>
              </div>
            )}
          </div>
        </section>
        </div>
      </div>
    </>
  )
}
