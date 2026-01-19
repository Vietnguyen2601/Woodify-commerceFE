import React from 'react'

type Filter = {
  id: string
  label: string
}

type Props = {
  filters: Filter[]
  active: string
  onChange: (id: string) => void
}

export default function VoucherFilter({ filters, active, onChange }: Props) {
  return (
    <div className='voucher-filters'>
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`voucher-filter${filter.id === active ? ' is-active' : ''}`}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
