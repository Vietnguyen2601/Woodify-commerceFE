import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input } from '@/components'
import { useAuth } from '../hooks'
import { ROUTES } from '@/constants'
import './auth.css'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isRegistering, registerError } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setValidationError('Mật khẩu phải có ít nhất 8 ký tự')
      return
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
      })
      navigate(ROUTES.HOME)
    } catch {
      // Error is handled by registerError
    }
  }

  const displayError = validationError || (registerError instanceof Error ? registerError.message : null)

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng ký</h1>
          <p className="auth-subtitle">Tạo tài khoản Wood Marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {displayError && (
            <div className="auth-error" role="alert">
              {displayError}
            </div>
          )}

          <Input
            label="Họ và tên"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            required
            fullWidth
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
            fullWidth
          />

          <Input
            label="Số điện thoại"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0901234567"
            fullWidth
          />

          <Input
            label="Mật khẩu"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            hint="Tối thiểu 8 ký tự"
            required
            fullWidth
          />

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            fullWidth
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isRegistering}
          >
            Đăng ký
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Đã có tài khoản?{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
