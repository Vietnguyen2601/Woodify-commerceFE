import React from 'react'
import { Link } from 'react-router-dom'

interface AuthPageHeaderProps {
  actionLabel: string
}

export default function AuthPageHeader({ actionLabel }: AuthPageHeaderProps) {
  return (
    <header className='auth-page-header' role='banner'>
      <div className='auth-page-header__inner'>
        <Link to='/' className='auth-page-header__brand'>WOODIFY</Link>
        <span className='auth-page-header__separator'>/</span>
        <span className='auth-page-header__action'>{actionLabel}</span>
      </div>
    </header>
  )
}
