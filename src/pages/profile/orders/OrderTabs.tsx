import React from 'react'

type Tab = {
  id: string
  label: string
  badge?: string
}

type Props = {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export default function OrderTabs({ tabs, active, onChange }: Props) {
  return (
    <div className='order-tabs'>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`order-tab${active === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.badge && <span className='order-tab__badge'>{tab.badge}</span>}
        </button>
      ))}
    </div>
  )
}
