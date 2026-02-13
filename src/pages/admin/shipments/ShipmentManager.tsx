import React from 'react'

const METRICS = [
  {
    label: 'Total Shipments',
    value: '8',
    iconBg: 'bg-blue-50',
    icon: (
      <svg className='h-5 w-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M3 7l9-4 9 4-9 4-9-4z' strokeLinejoin='round' />
        <path d='M3 7v10l9 4 9-4V7' />
      </svg>
    )
  },
  {
    label: 'In Transit',
    value: '2',
    iconBg: 'bg-purple-50',
    icon: (
      <svg className='h-5 w-5 text-purple-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M4 12h16M12 4l8 8-8 8' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  },
  {
    label: 'Delivered',
    value: '2',
    iconBg: 'bg-green-50',
    icon: (
      <svg className='h-5 w-5 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='m6 12 3 3 9-9' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  },
  {
    label: 'Pending Pickup',
    value: '1',
    iconBg: 'bg-orange-50',
    icon: (
      <svg className='h-5 w-5 text-orange-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1.6'>
        <path d='M5 12h14M5 12l4-4m-4 4 4 4' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  }
]

type ShipmentType = 'Standard' | 'Bulky' | 'Extra Bulky'
type ShipmentStatus = 'Delivered' | 'In Transit' | 'Out for Delivery' | 'Pickup Scheduled' | 'Picked Up' | 'Failed' | 'Returned'

type ShipmentRecord = {
  shipmentCode: string
  shortCode: string
  orderId: string
  provider: string
  tracking: string
  weight: string
  fee: string
  cod: string
  type: ShipmentType
  status: ShipmentStatus
  pickupDate: string
  deliveredDate: string
}

const SHIPMENTS: ShipmentRecord[] = [
  { shipmentCode: 'SHIP-2026-001847', shortCode: 'SHP-001', orderId: 'ORD-2026-001847', provider: 'FedEx Ground', tracking: 'FDX-8829461039847', weight: '185 lbs', fee: '$45.00', cod: '-', type: 'Extra Bulky', status: 'Delivered', pickupDate: 'Feb 11, 2026', deliveredDate: 'Feb 15, 2026' },
  { shipmentCode: 'SHIP-2026-001846', shortCode: 'SHP-002', orderId: 'ORD-2026-001846', provider: 'UPS Next Day Air', tracking: 'UPS-7738352984736', weight: '155 lbs', fee: '$85.00', cod: '$689.50', type: 'Bulky', status: 'In Transit', pickupDate: 'Feb 10, 2026', deliveredDate: '-' },
  { shipmentCode: 'SHIP-2026-001845', shortCode: 'SHP-003', orderId: 'ORD-2026-001845', provider: 'FedEx 2Day', tracking: 'FDX-8829461039848', weight: '65 lbs', fee: '$32.00', cod: '-', type: 'Standard', status: 'Out for Delivery', pickupDate: 'Feb 10, 2026', deliveredDate: '-' },
  { shipmentCode: 'SHIP-2026-001844', shortCode: 'SHP-004', orderId: 'ORD-2026-001844', provider: 'DHL Express', tracking: 'DHL-9940573058294', weight: '125 lbs', fee: '$55.00', cod: '$890.00', type: 'Bulky', status: 'Pickup Scheduled', pickupDate: 'Feb 12, 2026', deliveredDate: '-' },
  { shipmentCode: 'SHIP-2026-001843', shortCode: 'SHP-005', orderId: 'ORD-2026-001843', provider: 'FedEx Ground', tracking: 'FDX-8829461039849', weight: '165 lbs', fee: '$48.00', cod: '-', type: 'Bulky', status: 'Delivered', pickupDate: 'Feb 9, 2026', deliveredDate: 'Feb 14, 2026' },
  { shipmentCode: 'SHIP-2026-001842', shortCode: 'SHP-006', orderId: 'ORD-2026-001842', provider: 'USPS Priority Mail', tracking: 'USPS-4456789012345', weight: '45 lbs', fee: '$18.00', cod: '-', type: 'Standard', status: 'Picked Up', pickupDate: 'Feb 11, 2026', deliveredDate: '-' },
  { shipmentCode: 'SHIP-2026-001841', shortCode: 'SHP-007', orderId: 'ORD-2026-001841', provider: 'FedEx Ground', tracking: 'FDX-8829461039850', weight: '95 lbs', fee: '$38.00', cod: '-', type: 'Bulky', status: 'Failed', pickupDate: 'Feb 8, 2026', deliveredDate: '-' },
  { shipmentCode: 'SHIP-2026-001840', shortCode: 'SHP-008', orderId: 'ORD-2026-001840', provider: 'UPS Ground', tracking: 'UPS-7738352984737', weight: '205 lbs', fee: '$65.00', cod: '$2150.00', type: 'Extra Bulky', status: 'Returned', pickupDate: 'Feb 8, 2026', deliveredDate: '-' }
]

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  Delivered: 'border border-green-200 bg-green-100 text-green-700',
  'In Transit': 'border border-purple-200 bg-purple-100 text-purple-700',
  'Out for Delivery': 'border border-indigo-200 bg-indigo-100 text-indigo-700',
  'Pickup Scheduled': 'border border-blue-200 bg-blue-100 text-blue-700',
  'Picked Up': 'border border-cyan-200 bg-cyan-100 text-cyan-700',
  Failed: 'border border-red-200 bg-red-100 text-red-700',
  Returned: 'border border-orange-200 bg-orange-100 text-orange-700'
}

const TYPE_STYLES: Record<ShipmentType, string> = {
  Standard: 'border border-blue-200 bg-blue-100 text-blue-700',
  Bulky: 'border border-orange-200 bg-orange-100 text-orange-700',
  'Extra Bulky': 'border border-red-200 bg-red-100 text-red-700'
}

const ACTION_BUTTON = 'inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-stone-500 to-stone-600 px-4 py-2 text-sm font-semibold text-white shadow'

export default function ShipmentManager() {
  return (
    <div className='space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-bold text-gray-900'>Shipment Management</h1>
        <p className='text-sm text-gray-500'>Monitor and manage all shipment orders</p>
      </header>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {METRICS.map((metric) => (
          <div key={metric.label} className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{metric.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.iconBg}`}>{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <section className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='grid gap-4 lg:grid-cols-[2fr_repeat(3,minmax(0,1fr))]'>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Search Shipments</label>
            <div className='relative'>
              <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='7' />
                  <path d='m16.5 16.5 4 4' strokeLinecap='round' />
                </svg>
              </span>
              <input
                type='search'
                placeholder='Shipment code or tracking number...'
                className='h-10 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Status</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All statuses</option>
              <option>Delivered</option>
              <option>In Transit</option>
              <option>Out for Delivery</option>
              <option>Pickup Scheduled</option>
              <option>Picked Up</option>
              <option>Failed</option>
              <option>Returned</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Provider</label>
            <select className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none'>
              <option value=''>All providers</option>
              <option>FedEx Ground</option>
              <option>UPS</option>
              <option>DHL Express</option>
              <option>USPS Priority Mail</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-medium text-gray-700'>Date From</label>
            <input type='date' className='h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none' />
          </div>
        </div>
      </section>

      <p className='text-sm text-gray-600'>
        Showing <span className='font-semibold text-gray-900'>{SHIPMENTS.length}</span> shipments
      </p>

      <section className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-100 text-sm'>
            <thead className='bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3 text-left'>Shipment</th>
                <th className='px-6 py-3 text-left'>Order ID</th>
                <th className='px-6 py-3 text-left'>Provider</th>
                <th className='px-6 py-3 text-left'>Tracking</th>
                <th className='px-6 py-3 text-left'>Weight</th>
                <th className='px-6 py-3 text-left'>Fee</th>
                <th className='px-6 py-3 text-left'>COD</th>
                <th className='px-6 py-3 text-left'>Type</th>
                <th className='px-6 py-3 text-left'>Status</th>
                <th className='px-6 py-3 text-left'>Pickup</th>
                <th className='px-6 py-3 text-left'>Delivered</th>
                <th className='px-6 py-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-gray-900'>
              {SHIPMENTS.map((shipment) => (
                <tr key={shipment.shipmentCode}>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div>
                      <p className='font-medium'>{shipment.shipmentCode}</p>
                      <p className='text-xs text-gray-500'>{shipment.shortCode}</p>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-gray-700'>{shipment.orderId}</td>
                  <td className='px-6 py-4 text-gray-700'>{shipment.provider}</td>
                  <td className='px-6 py-4 font-mono text-sm text-gray-900'>{shipment.tracking}</td>
                  <td className='px-6 py-4'>{shipment.weight}</td>
                  <td className='px-6 py-4'>{shipment.fee}</td>
                  <td className='px-6 py-4'>{shipment.cod}</td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${TYPE_STYLES[shipment.type]}`}>{shipment.type}</span>
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${STATUS_STYLES[shipment.status]}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-gray-600'>{shipment.pickupDate}</td>
                  <td className='px-6 py-4 text-gray-600'>{shipment.deliveredDate}</td>
                  <td className='px-6 py-4 text-center'>
                    <button type='button' className={ACTION_BUTTON}>
                      <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                        <path d='M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z' />
                        <circle cx='12' cy='12' r='2' />
                      </svg>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
