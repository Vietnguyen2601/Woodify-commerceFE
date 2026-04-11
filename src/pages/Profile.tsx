import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/constants/routes'
import { api } from '../services/api/client'
import { authService, orderService, walletService, queryKeys } from '@/services'
import type { WalletTransactionItem } from '@/services/wallet.service'
import { BuyerOrdersPanel, type CustomerOrderBucket } from './profile/BuyerOrdersPanel'
import { APP_CONFIG } from '../constants/app.config'
import { CreditCard, Filter, Landmark, Wallet } from 'lucide-react'

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
import ChevronRightIcon from '@/assets/icons/essential/interface/chevron-right.svg'

type TabType = 'profile' | 'orders' | 'wallet' | 'settings'
type WalletTabType = 'history' | 'deposit'

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

const DEPOSIT_METHOD_TO_API = {
  momo: 'Momo',
  payos: 'PayOs',
  vnpay: 'VNPay',
} as const

function mapApiTransactionStatus(s?: string): Transaction['status'] {
  const u = (s || '').toUpperCase()
  if (['SUCCESS', 'COMPLETED', 'SUCCEEDED'].includes(u)) return 'success'
  if (['FAILED', 'CANCELLED', 'REJECTED'].includes(u)) return 'failed'
  return 'pending'
}

function mapWalletItemToTransaction(
  item: WalletTransactionItem,
  index: number,
  fallbackBalance: number
): Transaction {
  const id = String(item.id ?? item.paymentId ?? item.transactionId ?? `tx-${index}`)
  const amount = Number(item.amount ?? 0)
  const t = `${item.transactionType || item.type || ''}`.toLowerCase()
  let type: Transaction['type'] = 'income'
  if (t.includes('refund')) type = 'refund'
  else if (
    t.includes('pay') ||
    t.includes('order') ||
    t.includes('debit') ||
    t.includes('expense') ||
    t.includes('purchase') ||
    amount < 0
  ) {
    type = 'expense'
  }

  const createdRaw = item.createdAt != null ? String(item.createdAt) : ''
  const createdAt = createdRaw ? new Date(createdRaw) : null
  const valid = createdAt && !Number.isNaN(createdAt.getTime())
  const dateStr = valid ? createdAt.toLocaleDateString('vi-VN') : '—'
  const timeStr = valid
    ? createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : ''

  const title =
    (typeof item.description === 'string' && item.description) ||
    (typeof item.note === 'string' && item.note) ||
    (typeof item.title === 'string' && item.title) ||
    (type === 'income' ? 'Nạp tiền' : type === 'expense' ? 'Chi tiêu' : 'Hoàn tiền / Giao dịch')

  const balanceAfter =
    item.balanceAfter != null && !Number.isNaN(Number(item.balanceAfter))
      ? Number(item.balanceAfter)
      : fallbackBalance

  return {
    id,
    type,
    title,
    date: dateStr,
    time: timeStr,
    status: mapApiTransactionStatus(typeof item.status === 'string' ? item.status : undefined),
    amount,
    balance: balanceAfter,
  }
}

const PROFILE_TAB_KEYS: TabType[] = ['profile', 'orders', 'wallet', 'settings']

export default function Profile() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [walletTab, setWalletTab] = useState<WalletTabType>('history')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositMethod, setDepositMethod] = useState<'momo' | 'payos' | 'vnpay'>('payos')
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletData, setWalletData] = useState<any>(null)
  const [txPage, setTxPage] = useState(1)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: ''
  })
  const [orderBucket, setOrderBucket] = useState<CustomerOrderBucket>('all')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    promotionNotifications: false,
    newsletter: true,
  })

  // Deep link: /profile?tab=wallet (e.g. PayOS cancel callback redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab') as TabType | null
    if (!tab || !PROFILE_TAB_KEYS.includes(tab)) return
    setActiveTab(tab)
    if (tab === 'wallet') {
      setWalletTab('history')
    }
    params.delete('tab')
    const rest = params.toString()
    navigate({ pathname: ROUTES.PROFILE, search: rest ? `?${rest}` : '' }, { replace: true })
  }, [location.search, navigate])

  // Fetch authenticated user to get accountId and walletId
  const { data: authenticatedUser, isLoading: isUserLoading } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch wallet data using accountId from authenticated user
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['wallet', (authenticatedUser as any)?.accountId],
    queryFn: () => walletService.getWalletByAccountId((authenticatedUser as any)?.accountId),
    enabled: !!(authenticatedUser as any)?.accountId, // Only fetch when accountId exists
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Update wallet balance when wallet data is fetched
  useEffect(() => {
    if (wallet?.balance !== undefined) {
      setWalletBalance(wallet.balance)
      setWalletData(wallet)
    }
  }, [wallet])

  const walletIdForTx = wallet?.walletId || walletData?.walletId

  const { data: txPageData, isLoading: isTxLoading } = useQuery({
    queryKey: ['wallet-transactions', walletIdForTx, txPage],
    queryFn: () => walletService.getWalletTransactions(walletIdForTx!, { page: txPage, pageSize: 20 }),
    enabled: Boolean(walletIdForTx && activeTab === 'wallet'),
  })

  useEffect(() => {
    setTxPage(1)
  }, [walletIdForTx])

  const displayTransactions = useMemo(() => {
    const items = txPageData?.items
    if (!items?.length) return []
    return items.map((item, i) => mapWalletItemToTransaction(item, i, walletBalance))
  }, [txPageData, walletBalance])

  const accountIdForOrders =
    (authenticatedUser as { accountId?: string; id?: string } | undefined)?.accountId ||
    (authenticatedUser as { accountId?: string; id?: string } | undefined)?.id

  const { data: rawBuyerOrders = [], isLoading: buyerOrdersLoading, isError: buyerOrdersError } = useQuery({
    queryKey: [...queryKeys.orders.all(), 'account', accountIdForOrders],
    queryFn: () => orderService.getAccountOrders(accountIdForOrders!),
    enabled: Boolean(accountIdForOrders && activeTab === 'orders'),
  })

  // Fetch user account data on component mount
  useEffect(() => {
    // Wait until authenticated user is loaded
    if (isUserLoading) return

    const fetchAccountData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get accountId from authenticated user (now includes accountId from useAuth)
        let accountId = authenticatedUser?.accountId || authenticatedUser?.id
        
        if (!accountId) {
          const msg = 'Không thể lấy thông tin tài khoản.'
          setError(msg)
          setIsLoading(false)
          return
        }

        // Call API to get account details using the correct endpoint
        const endpoint = `/Accounts/GetAccountById/${accountId}`
        const response = await api.get(endpoint) as any
        
        // Extract account data - handle nested structure from API
        // API returns: { status, message, data: { accountId, username, email, ... } }
        let accountData = response?.data
        
        // If using api client that strips outer status, it might already be unwrapped
        if (response?.accountId) {
          accountData = response
        }
        
        if (!accountData) {
          const msg = 'Dữ liệu tài khoản không hợp lệ'
          setError(msg)
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
        const errorMsg = err.response?.data?.message || err.message || 'Không thể tải thông tin tài khoản'
        setError(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [authenticatedUser?.accountId || authenticatedUser?.id, isUserLoading])

  const menuItems = [
    { id: 'profile' as TabType, label: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'orders' as TabType, label: 'Đơn hàng', icon: PackageIcon },
    { id: 'wallet' as TabType, label: 'Ví của tôi', icon: WalletIcon },
    { id: 'settings' as TabType, label: 'Cài đặt', icon: SettingIcon }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const displayValue = (value: string | null | undefined) => {
    return value && value.trim() ? value : 'Chưa cập nhật'
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

  const transactionStatusLabel: Record<Transaction['status'], string> = {
    success: 'Thành công',
    pending: 'Đang xử lý',
    failed: 'Thất bại',
  }

  const transactionStatusClass: Record<Transaction['status'], string> = {
    success: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-700',
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

  const quickDepositOptions = [
    { value: 2000000, label: '2 Triệu' },
    { value: 5000000, label: '5 Triệu' },
    { value: 10000000, label: '10 Triệu' },
    { value: 20000000, label: '20 Triệu' }
  ]

  const depositMethodOptions = [
    { value: 'momo', label: 'Ví điện tử Momo', desc: 'Momo', Icon: Wallet },
    { value: 'payos', label: 'PayOS', desc: 'PayOS', Icon: CreditCard },
    { value: 'vnpay', label: 'VNPay', desc: 'VNPay', Icon: Landmark }
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
    
    const walletId = walletData?.walletId ?? wallet?.walletId
    if (!walletId) {
      setDepositError('Chưa có thông tin ví. Vui lòng tải lại trang sau khi đăng nhập.')
      return
    }

    setIsProcessingDeposit(true)
    try {
      const result = await walletService.topUp({
        walletId,
        amount: Math.round(amount),
        method: DEPOSIT_METHOD_TO_API[depositMethod],
      })
      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl)
        return
      }
      setDepositError('Không nhận được link thanh toán từ hệ thống.')
    } catch (err: any) {
      setDepositError(err?.message || 'Lỗi khi nạp tiền')
    } finally {
      setIsProcessingDeposit(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-100'>
      {/* Loading state */}
      {(isUserLoading || isLoading || isWalletLoading) && (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700'></div>
            <p className='mt-4 text-gray-600'>Đang tải...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <p className='text-red-600 font-semibold mb-4'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800'
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!error && !isLoading && (
      <div className='max-w-[1280px] mx-auto px-8 py-8'>
        <div className='flex gap-8'>
          {/* Sidebar - Left */}
          <div className='w-64 flex-shrink-0'>
            {/* User Profile Card with Gradient */}
            <div className='rounded-[20px] shadow-md p-8 mb-4' style={{ background: 'linear-gradient(to bottom, #D4B896, #E3DCC8)' }}>
              {/* Avatar */}
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <span className='text-3xl font-bold' style={{ color: '#BE9C73' }}>{((userInfo?.name || userInfo?.email) ?? 'U').charAt(0).toUpperCase()}</span>
              </div>
              {/* User Info */}
              <div className='text-center'>
                <h3 className='text-lg font-semibold mb-1' style={{ fontFamily: 'Poppins, sans-serif', color: '#6C5B50' }}>
                  {displayValue(userInfo.name)}
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
                            {depositMethodOptions.map((method) => {
                              const Icon = method.Icon

                              return (
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
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                    depositMethod === method.value ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    <Icon className='w-5 h-5' strokeWidth={depositMethod === method.value ? 2.6 : 2.2} />
                                  </div>
                                  <div>
                                    <p className='font-semibold text-gray-900 text-xs'>{method.label}</p>
                                    <p className='text-xs text-gray-500 leading-tight'>{method.desc}</p>
                                  </div>
                                  {depositMethod === method.value && (
                                    <span className='text-amber-600 text-xs font-semibold'>✓</span>
                                  )}
                                </label>
                              )
                            })}
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
                      {isTxLoading && (
                        <p className='text-center text-gray-500 py-8' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Đang tải lịch sử giao dịch...
                        </p>
                      )}
                      {!isTxLoading && displayTransactions.length === 0 && (
                        <p className='text-center text-gray-500 py-8' style={{ fontFamily: 'Arimo, sans-serif' }}>
                          Chưa có giao dịch nào.
                        </p>
                      )}
                      {!isTxLoading &&
                        displayTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className='flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors'
                          >
                            <div className='flex items-center gap-4 flex-1'>
                              <div
                                className={`w-12 h-12 ${getTransactionBgColor(transaction.type)} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md`}
                              >
                                {getTransactionIcon(transaction.type)}
                              </div>

                              <div className='flex-1'>
                                <h4 className='text-gray-800 font-semibold mb-1' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                  {transaction.title}
                                </h4>
                                <div className='flex items-center gap-3 flex-wrap'>
                                  <p className='text-gray-500 text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                    {transaction.date}
                                    {transaction.time ? ` • ${transaction.time}` : ''}
                                  </p>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${transactionStatusClass[transaction.status]}`}
                                    style={{ fontFamily: 'Arimo, sans-serif' }}
                                  >
                                    {transactionStatusLabel[transaction.status]}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className='text-right'>
                              <p
                                className={`text-lg font-bold mb-1 ${getTransactionColor(transaction.type)}`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                              >
                                {transaction.amount > 0 ? '+' : ''}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <p className='text-gray-500 text-sm' style={{ fontFamily: 'Arimo, sans-serif' }}>
                                Số dư: {formatCurrency(transaction.balance)}
                              </p>
                            </div>
                          </div>
                        ))}
                      {!isTxLoading && txPageData && txPageData.totalPages > 1 && (
                        <div className='flex items-center justify-center gap-4 pt-2'>
                          <button
                            type='button'
                            disabled={txPage <= 1}
                            onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                            className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                          >
                            Trước
                          </button>
                          <span className='text-sm text-gray-600'>
                            Trang {txPage} / {txPageData.totalPages}
                          </span>
                          <button
                            type='button'
                            disabled={txPage >= txPageData.totalPages}
                            onClick={() => setTxPage((p) => p + 1)}
                            className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                          >
                            Sau
                          </button>
                        </div>
                      )}
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
                            {((userInfo?.name || userInfo?.email) ?? 'U').charAt(0).toUpperCase()}
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
                          {displayValue(userInfo.name)}
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
                          {displayValue(userInfo.name)}
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
                          {displayValue(userInfo.phone)}
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
                          {userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN') : displayValue(userInfo.dateOfBirth)}
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
                          {displayValue(userInfo.gender)}
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
                          {displayValue(userInfo.address)}
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
              <BuyerOrdersPanel
                orders={rawBuyerOrders}
                isLoading={buyerOrdersLoading}
                isError={buyerOrdersError}
                orderBucket={orderBucket}
                onBucketChange={setOrderBucket}
                expandedOrderId={expandedOrderId}
                onToggleExpand={(orderId) =>
                  setExpandedOrderId((cur) => (cur === orderId ? null : orderId))
                }
              />
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
      )}
    </div>
  )
}
