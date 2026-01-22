import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input } from '@/components'
import { useAuth } from '../hooks'
import { ROUTES } from '@/constants'
import './auth.css'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoggingIn, loginError } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData)
      navigate(ROUTES.HOME)
    } catch {
      // Error is handled by loginError
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Chào mừng trở lại Wood Marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {loginError && (
            <div className="auth-error" role="alert">
              {loginError instanceof Error ? loginError.message : 'Đăng nhập thất bại'}
            </div>
          )}

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
            label="Mật khẩu"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            fullWidth
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoggingIn}
          >
            Đăng nhập
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản?{' '}
            <Link to={ROUTES.REGISTER} className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
