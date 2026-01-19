import React from 'react'

interface DashboardCardProps {
  title: string
  value?: string
  subtitle?: string
  trend?: string
  status?: 'positive' | 'negative' | 'neutral'
  badge?: string
  highlight?: boolean
  actions?: React.ReactNode
  children?: React.ReactNode
  footnote?: string
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  trend,
  status = 'neutral',
  badge,
  highlight,
  actions,
  children,
  footnote
}: DashboardCardProps) {
  return (
    <article className={`seller-card${highlight ? ' seller-card--highlight' : ''}`}>
      <header className='seller-card__header'>
        <div>
          <p className='seller-card__eyebrow'>{title}</p>
          {subtitle && <h3>{subtitle}</h3>}
        </div>
        {badge && <span className='seller-card__badge'>{badge}</span>}
        {actions && <div className='seller-card__actions'>{actions}</div>}
      </header>

      {value && (
        <div className='seller-card__value'>
          <strong>{value}</strong>
          {trend && <span className={`seller-card__trend seller-card__trend--${status}`}>{trend}</span>}
        </div>
      )}

      {children && <div className='seller-card__body'>{children}</div>}

      {footnote && <footer className='seller-card__footnote'>{footnote}</footer>}
    </article>
  )
}
