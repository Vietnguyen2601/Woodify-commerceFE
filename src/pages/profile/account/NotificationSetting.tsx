import React from 'react'

const CHANNELS = [
  { id: 'email', label: 'Email', description: 'Nhận thông báo qua email' },
  { id: 'sms', label: 'SMS', description: 'Nhận tin nhắn SMS' },
  { id: 'push', label: 'Thông báo đẩy', description: 'Nhận thông báo trên ứng dụng' }
]

export default function NotificationSetting() {
  const [selection, setSelection] = React.useState(() => new Set(['email', 'push']))

  const toggleChannel = (id: string) => {
    setSelection(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className='account-panel'>
      <header className='account-panel__header'>
        <div>
          <p className='eyebrow'>Cài đặt thông báo</p>
          <h3>Tùy chỉnh cách bạn muốn được liên hệ</h3>
        </div>
        <button className='cart-link'>Đặt lại mặc định</button>
      </header>

      <div className='notification-settings'>
        {CHANNELS.map(channel => (
          <label key={channel.id} className='notification-setting'>
            <div>
              <h4>{channel.label}</h4>
              <p>{channel.description}</p>
            </div>
            <input
              type='checkbox'
              checked={selection.has(channel.id)}
              onChange={() => toggleChannel(channel.id)}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
