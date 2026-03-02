import React, { useState, useEffect } from 'react'
import { api } from '../services/api/client'
import { APP_CONFIG } from '../constants/app.config'
import { Filter } from 'lucide-react'

// Import Icons
import UserIcon from '@/assets/icons/essential/interface/user.svg'
import PackageIcon from '@/assets/icons/essential/commerce/package.svg'
import WalletIcon from '@/assets/icons/essential/commerce/wallet.svg'
import SettingIcon from '@/assets/icons/essential/interface/setting.svg'
import PenIcon from '@/assets/icons/essential/interface/pen.svg'
import LockIcon from '@/assets/icons/essential/interface/lock.svg'
import ShieldCheckIcon from '@/assets/icons/essential/commerce/shield-check.svg'
import MoneyInIcon from '@/assets/icons/essential/commerce/money-in.svg'
import MoneyOutIcon from '@/assets/icons/essential/commerce/money-out.svg'
import RefreshIcon from '@/assets/icons/essential/commerce/refresh.svg'
import NotificationBellIcon from '@/assets/icons/essential/interface/notification-bell.svg'
import GlobeIcon from '@/assets/icons/essential/interface/globe.svg'
import TruckIcon from '@/assets/icons/essential/commerce/truck.svg'
import ChevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'
import MomoBrandIcon from '@/assets/icons/essential/brand/momo-removebg-preview.png'
import PayosBrandIcon from '@/assets/icons/essential/brand/payos-removebg-preview.png'
import VnpayBrandIcon from '@/assets/icons/essential/brand/vnpay-removebg-preview.png'

type TabType = 'profile' | 'orders' | 'wallet' | 'settings'
type WalletTabType = 'history' | 'deposit'
type OrderStatus = 'processing' | 'shipping' | 'completed' | 'cancelled'

interface Transaction {
  id: string
  type: 'income' | 'expense' | 'refund'
  title: string
  date: string
  time: string
  status: 'success' | 'pending' | 'failed'
  amount: number
  balance: number
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: OrderStatus
  items: {
    name: string
    quantity: number
    price: number
    image?: string
  }[]
  total: number
  shippingAddress: string
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('wallet')
  const [walletTab, setWalletTab] = useState<WalletTabType>('history')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositMethod, setDepositMethod] = useState<'momo' | 'payos' | 'vnpay'>('momo')
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  const walletBalance = 15750000
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0903038567',
    dateOfBirth: '1990-01-15',
    gender: 'Nam',
    address: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP. Hồ Chí Minh'
  })

  // Fetch user account data on component mount
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get accountId from localStorage
        const accountId = localStorage.getItem('account_id')
        
        if (!accountId) {
          setError('Không tìm thấy ID tài khoản')
          setIsLoading(false)
          return
        }

        // Call API to get account details
        const endpoint = `/Accounts/GetAccountById/${accountId}`
        
        const response = await api.get(endpoint) as any
        
        // Extract account data - check if it's nested in response.data.data or just response.data
        let accountData = response.data?.data
        
        // Fallback: if data is not nested, use response.data directly
        if (!accountData && response.data?.accountId) {
          accountData = response.data
        }
        
        if (!accountData) {
          setError('Dữ liệu tài khoản không hợp lệ')
          setIsLoading(false)
          return
        }

        // Format date from ISO to YYYY-MM-DD
        const formatDate = (isoDate: string | null | undefined) => {
          if (!isoDate) return ''
          try {
            const date = new Date(isoDate)
            // Check if date is valid
            if (isNaN(date.getTime())) {
              console.warn('⚠️ Invalid date:', isoDate)
              return ''
            }
            return date.toISOString().split('T')[0]
          } catch (err) {
            console.warn('⚠️ Error formatting date:', isoDate, err)
            return ''
          }
        }

        // Update userInfo with API data
        const updatedUserInfo = {
          name: accountData.name || '',
          email: accountData.email || '',
          phone: accountData.phoneNumber || '',
          dateOfBirth: formatDate(accountData.dob),
          gender: accountData.gender || '',
          address: userInfo.address
        }
        
        setUserInfo(updatedUserInfo)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Không thể tải thông tin tài khoản')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [])

  const menuItems = [
    { id: 'profile' as TabType, label: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'orders' as TabType, label: 'Đơn hàng', icon: PackageIcon },
    { id: 'wallet' as TabType, label: 'Ví của tôi', icon: WalletIcon },
    { id: 'settings' as TabType, label: 'Cài đặt', icon: SettingIcon }
  ]

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      title: 'Nạp tiền vào ví',
      date: '15/02/2026',
      time: '14:30',
      status: 'success',
      amount: 5000000,
      balance: 15750000
    },
    {
      id: '2',
      type: 'expense',
      title: 'Thanh toán đơn hàng #DH2024001',
      date: '14/02/2026',
      time: '10:15',
      status: 'success',
      amount: -3500000,
      balance: 10750000
    },
    {
      id: '3',
      type: 'refund',
      title: 'Hoàn tiền đơn hàng #DH2024002',
      date: '13/02/2026',
      time: '16:45',
      status: 'success',
      amount: 2250000,
      balance: 14250000
    }
  ]

  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'DH2024001',
      date: '14/02/2026',
      status: 'shipping',
      items: [
        { name: 'Ghế Sofa Cao Cấp', quantity: 1, price: 12500000 },
        { name: 'Bàn Trà Gỗ Sồi', quantity: 1, price: 3500000 }
      ],
      total: 16000000,
      shippingAddress: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM'
    },
    {
      id: '2',
      orderNumber: 'DH2024002',
      date: '10/02/2026',
      status: 'completed',
      items: [
        { name: 'Tủ Gỗ Trang Trí', quantity: 2, price: 4500000 }
      ],
      total: 9000000,
      shippingAddress: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM'
    },
    {
      id: '3',
      orderNumber: 'DH2024003',
      date: '05/02/2026',
      status: 'processing',
      items: [
        { name: 'Giường Ngủ Gỗ Tự Nhiên', quantity: 1, price: 18500000 }
      ],
      total: 18500000,
      shippingAddress: 'G30 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM'
    }
  ]

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    promotionNotifications: false,
    newsletter: true
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    const iconStyle = { filter: 'brightness(0) invert(1)' }
    switch (type) {
      case 'income':
        return <img src={MoneyInIcon} alt='Income' className='w-6 h-6' style={iconStyle} />
      case 'expense':
        return <img src={MoneyOutIcon} alt='Expense' className='w-6 h-6' style={iconStyle} />
      case 'refund':
        return <img src={RefreshIcon} alt='Refund' className='w-6 h-6' style={iconStyle} />
      default:
        return <img src={WalletIcon} alt='Transaction' className='w-6 h-6' style={iconStyle} />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-500'
      case 'expense':
        return 'bg-red-500'
      case 'refund':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getOrderStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return 'Đang xử lý'
      case 'shipping':
        return 'Đang giao'
      case 'completed':
        return 'Hoàn thành'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return { bg: 'bg-blue-100', text: 'text-blue-700' }
      case 'shipping':
        return { bg: 'bg-orange-100', text: 'text-orange-700' }
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700' }
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
  }

  const quickDepositOptions = [
    { value: 2000000, label: '2 Triệu' },
    { value: 5000000, label: '5 Triệu' },
    { value: 10000000, label: '10 Triệu' },
    { value: 20000000, label: '20 Triệu' }
  ]

  const depositMethodOptions = [
    { value: 'momo', label: 'Ví điện tử Momo', desc: 'Momo', icon: MomoBrandIcon },
    { value: 'payos', label: 'PayOS', desc: 'PayOS', icon: PayosBrandIcon },
    { value: 'vnpay', label: 'VNPay', desc: 'VNPay', icon: VnpayBrandIcon }
  ]

  const handleQuickAmountSelect = (value: number) => {
    setDepositAmount(value.toString())
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDepositError(null)
    
    const amount = parseFloat(depositAmount)
    if (!depositAmount || amount <= 0) {
      setDepositError('Vui lòng nhập số tiền')
      return
    }
    if (amount < 10000) {
      setDepositError('Số tiền tối thiểu là 10.000đ')
      return
    }
    if (amount > 100000000) {
      setDepositError('Số tiền tối đa là 100.000.000đ')
      return
    }
    
    setIsProcessingDeposit(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setWalletTab('history')
      setDepositAmount('')
      setDepositMethod('momo')
    } catch (err: any) {
      setError(err.message || 'Lỗi khi nạp tiền')
    } finally {
      setIsProcessingDeposit(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-100'>
      {/* Main Content */}
      <div className='max-w-[1280px] mx-auto px-8 py-8'>
        <div className='flex gap-8'>
          {/* Sidebar - Left */}
          <div className='w-64 flex-shrink-0'>
            {/* User Profile Card with Gradient */}
            <div className='rounded-[20px] shadow-md p-8 mb-4' style={{ background: 'linear-gradient(to bottom, #D4B896, #E3DCC8)' }}>
              {/* Avatar */}
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <span className='text-3xl font-bold' style={{ color: '#BE9C73' }}>{userInfo.name.charAt(0)}</span>
              </div>
              {/* User Info */}
              <div className='text-center'>
                <h3 className='text-lg font-semibold mb-1' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                  {userInfo.name}
                </h3>
                <p className='text-sm' style={{ fontFamily: 'Arimo, sans-serif', color: '#6C5B50', opacity: 0.8 }}>
                  {userInfo.email}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className='bg-white rounded-[20px] shadow-md p-2'>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all duration-200 text-left ${
                    activeTab === item.id
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === item.id ? { fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' } : { fontFamily: 'Arimo, sans-serif' }}
                >
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className='w-5 h-5'
                    style={{ filter: activeTab === item.id ? 'brightness(0) invert(1)' : 'none' }}
                  />
                  <span className='text-sm font-medium'>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area - Wallet Section */}
          <div className='flex-1'>
            {activeTab === 'wallet' && (
              <div className='space-y-8'>
                {/* Page Title */}

                {/* Balance Card with Gradient */}
                <div className='rounded-[20px] shadow-lg p-8' style={{ background: 'linear-gradient(to right, #D4B896, #E3DCC8)' }}>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-sm mb-2' style={{ fontFamily: 'Arbutus Slab, serif', color: '#6C5B50', opacity: 0.8 }}>
                        Số dư ví
                      </p>
                      <h2 className='text-4xl font-bold mb-6' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                        {formatCurrency(walletBalance)}
                      </h2>
                      <button onClick={() => setWalletTab('deposit')} className='bg-white px-6 py-3 rounded-[10px] font-semibold hover:bg-white/90 transition-colors shadow-md' style={{ fontFamily: 'Arimo, sans-serif', color: '#BE9C73' }}>
                        Nạp tiền
                      </button>
                    </div>

                    {/* Stats Boxes */}
                    <div className='flex gap-4'>
                      <div className='bg-white/20 backdrop-blur-sm rounded-[10px] p-4 min-w-[140px]'>
                        <div className='flex items-center gap-2 mb-2'>
                          <img src={MoneyInIcon} alt='Money In' className='w-6 h-6' style={{ filter: 'brightness(0) saturate(100%) invert(26%) sepia(13%) saturate(814%) hue-rotate(343deg) brightness(94%) contrast(91%)' }} />
                          <p className='text-xs' style={{ fontFamily: 'Arbutus Slab, serif', color: '#6C5B50', opacity: 0.8 }}>
                            Tổng nạp
                          </p>
                        </div>
                        <p className='text-xl font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                          25M
                        </p>
                      </div>
                      <div className='bg-white/20 backdrop-blur-sm rounded-[10px] p-4 min-w-[140px]'>
                        <div className='flex items-center gap-2 mb-2'>
                          <img src={MoneyOutIcon} alt='Money Out' className='w-6 h-6' style={{ filter: 'brightness(0) saturate(100%) invert(26%) sepia(13%) saturate(814%) hue-rotate(343deg) brightness(94%) contrast(91%)' }} />
                          <p className='text-xs' style={{ fontFamily: 'Arbutus Slab, serif', color: '#6C5B50', opacity: 0.8 }}>
                            Tổng chi
                          </p>
                        </div>
                        <p className='text-xl font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                          18.75M
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs and Filters */}
                <div className='bg-white rounded-[20px] shadow-md p-6'>
                  {/* Tabs */}
                  <div className='flex items-center justify-between mb-6 border-b border-gray-200'>
                    <div className='flex gap-8'>
                      <button
                        onClick={() => setWalletTab('history')}
                        className={`pb-3 px-2 transition-all ${
                          walletTab === 'history'
                            ? 'text-gray-800 border-b-2 border-gray-300 font-semibold'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        Lịch sử
                      </button>
                      <button
                        onClick={() => setWalletTab('deposit')}
                        className={`pb-3 px-2 transition-all ${
                          walletTab === 'deposit'
                            ? 'text-gray-800 border-b-2 border-gray-300 font-semibold'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        style={{ fontFamily: 'Arimo, sans-serif' }}
                      >
                        Nạp tiền
                      </button>
                    </div>

                    {walletTab !== 'deposit' && (
                      /* Filter Buttons */
                      <div className='flex gap-2'>
                        <button className='px-4 py-2 border border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-50 transition-colors text-sm inline-flex items-center gap-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          <Filter className='w-4 h-4' strokeWidth={2.2} />
                          Lọc
                        </button>
                        <button className='px-4 py-2 bg-gray-100 border border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Tháng này
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Deposit Form Content */}
                  {walletTab === 'deposit' && (
                    <form onSubmit={handleDepositSubmit} className='w-full'>
                      <div className='space-y-4'>
                        {/* Custom Amount */}
                        <div className='space-y-1.5'>
                          <label className='text-sm font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                            Nhập số tiền khác
                          </label>
                          <div className='relative'>
                            <input
                              type='number'
                              value={depositAmount}
                              onChange={(e) => {
                                setDepositAmount(e.target.value)
                                setDepositError(null)
                              }}
                              placeholder='Nhập số tiền...'
                              className={`w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:bg-white focus:outline-none transition-colors ${
                                depositError
                                  ? 'border-red-500 focus:border-red-500 animate-pulse bg-red-50 focus:bg-red-50'
                                  : 'border-gray-200 focus:border-amber-500'
                              }`}
                              style={{ fontFamily: 'Arimo, sans-serif' }}
                            />
                            <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400'>đ</span>
                          </div>
                          {depositError ? (
                            <p className='text-xs text-red-500 font-semibold' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              ⚠️ {depositError}
                            </p>
                          ) : (
                            <p className='text-xs text-gray-400' style={{ fontFamily: 'Arimo, sans-serif' }}>Tối thiểu 10.000đ • Tối đa 100.000.000đ</p>
                          )}
                        </div>

                        {/* Payment Methods */}
                        <div className='space-y-2'>
                          <p className='text-sm font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                            Phương thức thanh toán
                          </p>
                          <div className='grid grid-cols-3 gap-2'>
                            {depositMethodOptions.map((method) => (
                              <label
                                key={method.value}
                                className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all text-center ${
                                  depositMethod === method.value
                                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                style={{ fontFamily: 'Arimo, sans-serif' }}
                              >
                                <input
                                  type='radio'
                                  name='depositMethod'
                                  value={method.value}
                                  checked={depositMethod === method.value}
                                  onChange={(e) => setDepositMethod(e.target.value as 'momo' | 'payos' | 'vnpay')}
                                  className='absolute opacity-0'
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border ${
                                  depositMethod === method.value ? 'border-amber-400 bg-white' : 'border-gray-200 bg-gray-50'
                                }`}>
                                  <img src={method.icon} alt={method.label} className='w-full h-full object-contain scale-[1.25]' />
                                </div>
                                <div>
                                  <p className='font-semibold text-gray-900 text-xs'>{method.label}</p>
                                  <p className='text-xs text-gray-500 leading-tight'>{method.desc}</p>
                                </div>
                                {depositMethod === method.value && (
                                  <span className='text-amber-600 text-xs font-semibold'>✓</span>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex gap-2 pt-2'>
                          <button
                            type='button'
                            onClick={() => setWalletTab('history')}
                            disabled={isProcessingDeposit}
                            className='flex-1 rounded-lg border-2 border-gray-300 py-2 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors'
                            style={{ fontFamily: 'Arimo, sans-serif' }}
                          >
                            Quay lại
                          </button>
                          <button
                            type='submit'
                            disabled={!depositAmount || isProcessingDeposit}
                            className='flex-1 rounded-lg bg-amber-600 py-2 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-700'
                            style={{ fontFamily: 'Arimo, sans-serif' }}
                          >
                            {isProcessingDeposit ? 'Đang xử lý...' : 'Nạp tiền ngay'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Transaction List */}
                  {walletTab !== 'deposit' && (
                    <div className='space-y-4'>
                      {transactions.map(transaction => (
                        <div
                          key={transaction.id}
                          className='flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors'
                        >
                          {/* Left Side - Icon and Details */}
                          <div className='flex items-center gap-4 flex-1'>
                            {/* Icon Circle */}
                            <div className={`w-12 h-12 ${getTransactionBgColor(transaction.type)} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                              {getTransactionIcon(transaction.type)}
                            </div>

                            {/* Transaction Details */}
                            <div className='flex-1'>
                              <h4 className='text-gray-800 font-semibold mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                {transaction.title}
                              </h4>
                              <div className='flex items-center gap-3'>
                                <p className='text-gray-500 text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                  {transaction.date} • {transaction.time}
                                </p>
                                <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                  Thành công
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Amount and Balance */}
                          <div className='text-right'>
                            <p className={`text-lg font-bold mb-1 ${getTransactionColor(transaction.type)}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </p>
                            <p className='text-gray-500 text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              Số dư: {formatCurrency(transaction.balance)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className='space-y-8'>
                {/* Profile Card */}
                <div className='bg-white rounded-[20px] shadow-md p-8'>
                  {/* Avatar Section */}
                  <div className='flex items-center justify-between gap-6 pb-8 mb-8 border-b border-gray-200'>
                    <div className='flex items-center gap-6'>
                      <div className='relative'>
                        <div className='w-24 h-24 rounded-full flex items-center justify-center shadow-lg' style={{ background: 'linear-gradient(to bottom, #D4B896, #E3DCC8)' }}>
                          <span className='text-4xl font-bold' style={{ color: '#BE9C73' }}>
                            {userInfo.name.charAt(0)}
                          </span>
                        </div>
                        {isEditing && (
                          <button className='absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 hover:scale-110 transition-transform' style={{ borderColor: '#BE9C73' }}>
                            <img src={PenIcon} alt='Upload' className='w-4 h-4' style={{ filter: 'brightness(0) saturate(100%) invert(61%) sepia(21%) saturate(630%) hue-rotate(348deg) brightness(92%) contrast(88%)' }} />
                          </button>
                        )}
                      </div>
                      <div>
                        <h2 className='text-2xl font-bold mb-1' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                          {userInfo.name}
                        </h2>
                        <p className='text-gray-600' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className='px-6 py-3 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity shadow-md flex items-center gap-2 flex-shrink-0'
                        style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}
                      >
                        <img src={PenIcon} alt='Edit' className='w-4 h-4' style={{ filter: 'brightness(0) invert(1)' }} />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className='grid grid-cols-2 gap-6'>
                    {/* Họ và tên */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Họ và tên
                      </label>
                      {isEditing ? (
                        <input
                          type='text'
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.name}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type='email'
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.email}
                        </div>
                      )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type='tel'
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.phone}
                        </div>
                      )}
                    </div>

                    {/* Ngày sinh */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Ngày sinh
                      </label>
                      {isEditing ? (
                        <input
                          type='date'
                          value={userInfo.dateOfBirth}
                          onChange={(e) => setUserInfo({ ...userInfo, dateOfBirth: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>

                    {/* Giới tính */}
                    <div>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Giới tính
                      </label>
                      {isEditing ? (
                        <select
                          value={userInfo.gender}
                          onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        >
                          <option value='Nam'>Nam</option>
                          <option value='Nữ'>Nữ</option>
                          <option value='Khác'>Khác</option>
                        </select>
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.gender}
                        </div>
                      )}
                    </div>

                    {/* Địa chỉ - Full width */}
                    <div className='col-span-2'>
                      <label className='block text-gray-700 text-sm font-semibold mb-2' style={{ fontFamily: 'Arimo, sans-serif' }}>
                        Địa chỉ
                      </label>
                      {isEditing ? (
                        <textarea
                          value={userInfo.address}
                          onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                          rows={3}
                          className='w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-2 transition-colors resize-none'
                          style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896' }}
                          onFocus={(e) => e.target.style.borderColor = '#BE9C73'}
                          onBlur={(e) => e.target.style.borderColor = '#D4B896'}
                        />
                      ) : (
                        <div className='px-4 py-3 bg-gray-50 rounded-[10px] border border-gray-200' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          {userInfo.address}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className='flex gap-4 mt-8 pt-6 border-t border-gray-200'>
                      <button
                        onClick={() => setIsEditing(false)}
                        className='px-8 py-3 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity shadow-md'
                        style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className='px-8 py-3 border-2 rounded-[10px] font-semibold hover:bg-gray-50 transition-colors'
                        style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896', color: '#6C5B50' }}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className='space-y-8'>
                {/* Orders List */}
                <div className='space-y-4'>
                  {orders.map(order => {
                    const statusColor = getOrderStatusColor(order.status)
                    return (
                      <div key={order.id} className='bg-white rounded-[20px] shadow-md p-6 hover:shadow-lg transition-shadow'>
                        {/* Order Header */}
                        <div className='flex justify-between items-start mb-4 pb-4 border-b border-gray-200'>
                          <div>
                            <div className='flex items-center gap-3 mb-2'>
                              <h3 className='text-lg font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                                #{order.orderNumber}
                              </h3>
                              <span className={`px-3 py-1 ${statusColor.bg} ${statusColor.text} rounded-full text-xs font-semibold`} style={{ fontFamily: 'Arimo, sans-serif' }}>
                                {getOrderStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              Ngày đặt: {order.date}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-gray-500 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>Tổng tiền</p>
                            <p className='text-xl font-bold' style={{ fontFamily: 'Poppins, sans-serif', color: '#BE9C73' }}>
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className='space-y-3 mb-4'>
                          {order.items.map((item, index) => (
                            <div key={index} className='flex justify-between items-center py-3 px-4 bg-gray-50 rounded-[10px]'>
                              <div>
                                <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                  {item.name}
                                </p>
                                <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                              <p className='font-bold text-gray-700' style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                          <div>
                            <p className='text-sm text-gray-600 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              <img src={TruckIcon} alt='Truck' className='w-4 h-4 inline mr-1' /> Địa chỉ giao hàng:
                            </p>
                            <p className='text-sm font-medium text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>
                              {order.shippingAddress}
                            </p>
                          </div>
                          <div className='flex gap-2'>
                            <button className='px-4 py-2 border-2 rounded-[10px] font-semibold hover:bg-gray-50 transition-colors text-sm' style={{ fontFamily: 'Arimo, sans-serif', borderColor: '#D4B896', color: '#6C5B50' }}>
                              Chi tiết
                            </button>
                            {order.status === 'completed' && (
                              <button className='px-4 py-2 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity text-sm' style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}>
                                Mua lại
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Empty State (if needed) */}
                {orders.length === 0 && (
                  <div className='bg-white rounded-[20px] shadow-md p-16 text-center'>
                    <img src={PackageIcon} alt='Package' className='w-24 h-24 mx-auto mb-4 opacity-30' />
                    <h3 className='text-xl font-bold text-gray-800 mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Chưa có đơn hàng nào
                    </h3>
                    <p className='text-gray-600 mb-6' style={{ fontFamily: 'Arimo, sans-serif' }}>
                      Bạn chưa có đơn hàng nào. Hãy khám phá sản phẩm của chúng tôi!
                    </p>
                    <button className='px-6 py-3 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity' style={{ fontFamily: 'Arimo, sans-serif', backgroundColor: '#BE9C73' }}>
                      Mua sắm ngay
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className='space-y-8'>
                {/* Notifications Settings */}
                <div className='bg-white rounded-[20px] shadow-md p-8'>
                  <h3 className='text-xl font-bold mb-6' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                    Thông báo
                  </h3>
                  <div className='space-y-4'>
                    {/* Email Notifications */}
                    <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Thông báo qua Email
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Nhận các thông báo quan trọng qua email
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.emailNotifications ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Order Notifications */}
                    <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Thông báo đơn hàng
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Cập nhật trạng thái đơn hàng của bạn
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, orderNotifications: !settings.orderNotifications})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.orderNotifications ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.orderNotifications ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Promotion Notifications */}
                    <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Thông báo khuyến mãi
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Nhận thông tin về các chương trình khuyến mãi
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, promotionNotifications: !settings.promotionNotifications})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.promotionNotifications ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.promotionNotifications ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Newsletter */}
                    <div className='flex items-center justify-between py-4'>
                      <div>
                        <p className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Nhận bản tin
                        </p>
                        <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Đăng ký nhận bản tin hàng tuần
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, newsletter: !settings.newsletter})}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.newsletter ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.newsletter ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className='bg-white rounded-[20px] shadow-md p-8'>
                  <h3 className='text-xl font-bold mb-6' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                    Bảo mật & Quyền riêng tư
                  </h3>
                  <div className='space-y-3'>
                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#FED7AA' }}>
                          <img src={LockIcon} alt='Lock' className='w-6 h-6' style={{ filter: 'brightness(0) saturate(100%) invert(61%) sepia(21%) saturate(630%) hue-rotate(348deg) brightness(92%) contrast(88%)' }} />
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Đổi mật khẩu</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Cập nhật mật khẩu của bạn</p>
                        </div>
                      </div>
                      <img src={ChevronRightIcon} alt='Arrow' className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors' />
                    </button>

                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#DCFCE7' }}>
                          <img src={ShieldCheckIcon} alt='Shield' className='w-6 h-6' style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(393%) hue-rotate(93deg) brightness(95%) contrast(89%)' }} />
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Xác thực hai yếu tố</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Tăng cường bảo mật tài khoản</p>
                        </div>
                      </div>
                      <img src={ChevronRightIcon} alt='Arrow' className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors' />
                    </button>

                    <button className='w-full flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors group'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: '#BFDBFE' }}>
                          <img src={GlobeIcon} alt='Privacy' className='w-6 h-6' style={{ filter: 'brightness(0) saturate(100%) invert(51%) sepia(93%) saturate(1745%) hue-rotate(192deg) brightness(101%) contrast(101%)' }} />
                        </div>
                        <div className='text-left'>
                          <p className='font-semibold text-gray-800' style={{ fontFamily: 'Arimo, sans-serif' }}>Quyền riêng tư</p>
                          <p className='text-sm text-gray-500' style={{ fontFamily: 'Arimo, sans-serif' }}>Quản lý quyền riêng tư dữ liệu</p>
                        </div>
                      </div>
                      <img src={ChevronRightIcon} alt='Arrow' className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors' />
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className='bg-white rounded-[20px] shadow-md p-8 border-2 border-red-200'>
                  <h3 className='text-xl font-bold mb-4' style={{ fontFamily: 'Poppins, sans-serif', color: '#DC2626' }}>
                    Vùng nguy hiểm
                  </h3>
                  <p className='text-sm text-gray-600 mb-4' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Các hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
                  </p>
                  <button className='px-6 py-3 bg-red-500 text-white rounded-[10px] font-semibold hover:bg-red-600 transition-colors' style={{ fontFamily: 'Arimo, sans-serif' }}>
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
     </div>
  )
}
