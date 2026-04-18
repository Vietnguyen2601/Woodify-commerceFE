import React, { ChangeEvent, useMemo, useState } from 'react'
import { PLACEHOLDER_IMAGE_URL } from '@/constants'

type OrderStatusKey = 'pending' | 'quote' | 'processing' | 'shipping' | 'completed' | 'dispute' | 'packing'
type WorkKey = 'await_confirm' | 'pack_today' | 'prepare_ship' | 'dispute_queue'

interface TimelineEvent {
  at: string
  actor: string
  label: string
  note?: string
  attachments?: { name: string; type: string }[]
}

interface Order {
  id: string
  buyer: string
  status: string
  statusKey: OrderStatusKey
  workKey: WorkKey | null
  value: number
  flags: string[]
  species: string
  grade: string
  moisture: string
  dimensions: string
  weightKg: number
  updatedAt: string
  items: number
  shippingProfile: string
  slaMinutes: number
  timeline: TimelineEvent[]
}

interface Listing {
  sku: string
  title: string
  species: string
  grade: string
  moisture: string
  dims: string
  price: number
  unit: string
  stock: { available: number; reserved: number }
  certifications: string[]
  thumbnail: string
}

interface InventoryItem {
  sku: string
  species: string
  grade: string
  available: number
  reserved: number
  safety: number
}

interface Certificate {
  id: string
  type: string
  status: 'valid' | 'expired'
  expires: string
  linkedSkus: string[]
}

interface ConfiguratorInputs {
  length: number
  width: number
  thickness: number
}

interface ConfiguratorPreview {
  price: string
  eta: string
  surchargeNote?: string
  warning?: string
}

interface WorkTile {
  id: WorkKey
  label: string
  count: number
  deadline: string
  severity: 'high' | 'medium' | 'low'
  filterKey: OrderStatusKey | WorkKey | 'all'
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'listings', label: 'Listings' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'fulfillment', label: 'Fulfillment' },
  { key: 'reports', label: 'Reports' },
  { key: 'finance', label: 'Finance' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'settings', label: 'Settings' }
]

const KPI_DATA = [
  { label: 'Doanh thu hôm nay', value: '₫185.000.000', delta: '+12% so với hôm qua', live: true },
  { label: 'Đơn đang xử lý', value: '24', delta: '6 cần xác nhận', live: true },
  { label: 'Cảnh báo tồn kho', value: '6 SKU', delta: '3 dưới ngưỡng an toàn', live: false },
  { label: 'Tỉ lệ trả hàng', value: '1.8%', delta: 'Ổn định', live: false }
]

const WORKLIST: WorkTile[] = [
  { id: 'await_confirm', label: 'Chờ xác nhận', count: 4, deadline: '< 45 phút', severity: 'high', filterKey: 'pending' },
  { id: 'pack_today', label: 'Đóng gói hôm nay', count: 6, deadline: 'Trước 14:00', severity: 'medium', filterKey: 'processing' },
  { id: 'prepare_ship', label: 'Chờ vận chuyển', count: 5, deadline: 'Pickup 17:00', severity: 'medium', filterKey: 'shipping' },
  { id: 'dispute_queue', label: 'Tranh chấp', count: 1, deadline: 'Phản hồi < 24h', severity: 'high', filterKey: 'dispute' }
]

const ORDER_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'quote', label: 'Chờ báo giá' },
  { key: 'processing', label: 'Đang chuẩn bị' },
  { key: 'packing', label: 'Đóng gói' },
  { key: 'shipping', label: 'Chờ vận chuyển' },
  { key: 'dispute', label: 'Tranh chấp' }
]

const INITIAL_ORDERS: Order[] = [
  {
    id: 'GH-240105-001',
    buyer: 'Công ty Nội thất Minh Long',
    status: 'Chờ xác nhận',
    statusKey: 'pending',
    workKey: 'await_confirm',
    value: 18500000,
    flags: ['Hàng quá khổ', 'White-glove'],
    species: 'Teak',
    grade: 'AA',
    moisture: '10%',
    dimensions: '3000 × 450 × 25 mm',
    weightKg: 55,
    updatedAt: '09:05',
    items: 12,
    shippingProfile: 'White-glove',
    slaMinutes: 45,
    timeline: [
      { at: '08:35', actor: 'Buyer', label: 'Đặt đơn', note: 'Yêu cầu giao trong ngày' },
      { at: '08:50', actor: 'Hệ thống', label: 'Đã giữ tồn kho', note: '12 tấm TE-09' }
    ]
  },
  {
    id: 'GH-240105-002',
    buyer: 'Xưởng Gỗ Hòa Bình',
    status: 'Chờ báo giá',
    statusKey: 'quote',
    workKey: 'await_confirm',
    value: 9800000,
    flags: ['Cắt theo yêu cầu'],
    species: 'Sồi đỏ',
    grade: 'A1',
    moisture: '8%',
    dimensions: 'Yêu cầu cut-to-size',
    weightKg: 30,
    updatedAt: '08:10',
    items: 8,
    shippingProfile: 'Standard',
    slaMinutes: 60,
    timeline: [
      { at: '07:55', actor: 'Buyer', label: 'Gửi yêu cầu tuỳ chỉnh', note: 'L=2100mm, W=180mm' },
      { at: '08:05', actor: 'Hệ thống', label: 'Đang chờ báo giá' }
    ]
  },
  {
    id: 'GH-240105-003',
    buyer: 'Azura Décor',
    status: 'Đang chuẩn bị',
    statusKey: 'processing',
    workKey: 'pack_today',
    value: 24300000,
    flags: ['Ưu tiên'],
    species: 'Gõ đỏ',
    grade: 'B',
    moisture: '12%',
    dimensions: '2200 × 300 × 30 mm',
    weightKg: 70,
    updatedAt: '09:00',
    items: 14,
    shippingProfile: 'Standard',
    slaMinutes: 120,
    timeline: [
      { at: '07:40', actor: 'Staff', label: 'Bắt đầu gia công', note: 'Kiểm tra độ ẩm 12%' },
      { at: '08:30', actor: 'Warehouse', label: 'Chuẩn bị đóng gói' }
    ]
  },
  {
    id: 'GH-240105-004',
    buyer: 'Nội thất Tre Xanh',
    status: 'Tranh chấp',
    statusKey: 'dispute',
    workKey: 'dispute_queue',
    value: 7200000,
    flags: ['Tranh chấp'],
    species: 'Gỗ thông',
    grade: 'Select',
    moisture: '9%',
    dimensions: '2400 × 200 × 20 mm',
    weightKg: 25,
    updatedAt: '09:20',
    items: 10,
    shippingProfile: 'Standard',
    slaMinutes: 1440,
    timeline: [
      {
        at: '08:10',
        actor: 'Buyer',
        label: 'Mở tranh chấp',
        note: 'Xước nhẹ bề mặt',
        attachments: [
          { name: 'scratch-photo.jpg', type: 'image/jpeg' },
          { name: 'delivery-note.pdf', type: 'application/pdf' }
        ]
      }
    ]
  },
  {
    id: 'GH-240105-005',
    buyer: 'Công ty Kiến Trúc Lâm',
    status: 'Chờ vận chuyển',
    statusKey: 'shipping',
    workKey: 'prepare_ship',
    value: 12450000,
    flags: ['LTL'],
    species: 'Sồi trắng',
    grade: 'Premium',
    moisture: '7%',
    dimensions: '2600 × 300 × 22 mm',
    weightKg: 60,
    updatedAt: '08:50',
    items: 16,
    shippingProfile: 'LTL',
    slaMinutes: 180,
    timeline: [
      { at: '07:10', actor: 'Warehouse', label: 'Đã đóng gói', note: '02 kiện pallet' },
      { at: '08:40', actor: 'Carrier', label: 'Đã nhận lịch lấy hàng' }
    ]
  },
  {
    id: 'GH-240105-006',
    buyer: 'Xưởng Đồng Tâm',
    status: 'Đóng gói',
    statusKey: 'packing',
    workKey: 'pack_today',
    value: 31600000,
    flags: ['Hàng quá khổ'],
    species: 'Teak nguyên khối',
    grade: 'AA',
    moisture: '11%',
    dimensions: '3200 × 500 × 40 mm',
    weightKg: 95,
    updatedAt: '09:15',
    items: 6,
    shippingProfile: 'White-glove',
    slaMinutes: 90,
    timeline: [
      { at: '08:05', actor: 'QC', label: 'Đo độ ẩm', note: '11% đạt chuẩn' },
      { at: '08:55', actor: 'Warehouse', label: 'Gia cố bao bì' }
    ]
  },
  {
    id: 'GH-240105-007',
    buyer: 'Kiến trúc sư Hương',
    status: 'Chờ xác nhận',
    statusKey: 'pending',
    workKey: 'await_confirm',
    value: 5900000,
    flags: ['Cắt theo yêu cầu'],
    species: 'Thông NZ',
    grade: 'KD',
    moisture: '10%',
    dimensions: 'Theo cấu hình',
    weightKg: 18,
    updatedAt: '09:12',
    items: 5,
    shippingProfile: 'Standard',
    slaMinutes: 50,
    timeline: [
      { at: '08:45', actor: 'Buyer', label: 'Gửi bản vẽ', note: 'Panel 150mm' }
    ]
  },
  {
    id: 'GH-240105-008',
    buyer: 'Studio Gỗ Onyx',
    status: 'Hoàn tất',
    statusKey: 'completed',
    workKey: null,
    value: 4150000,
    flags: [],
    species: 'Sồi hun',
    grade: 'AA',
    moisture: '8%',
    dimensions: '2100 × 180 × 15 mm',
    weightKg: 20,
    updatedAt: '07:30',
    items: 6,
    shippingProfile: 'Standard',
    slaMinutes: 0,
    timeline: [
      { at: '07:30', actor: 'System', label: 'Đã hoàn tất', note: 'Buyer xác nhận nhận hàng' }
    ]
  }
]

const INITIAL_LISTINGS: Listing[] = [
  {
    sku: 'SOI-A1',
    title: 'Ván Sồi đỏ ghép thanh',
    species: 'Sồi đỏ',
    grade: 'A1',
    moisture: '8%',
    dims: '2400 × 200 × 20 mm',
    price: 1250000,
    unit: 'm²',
    stock: { available: 120, reserved: 35 },
    certifications: ['FSC'],
    thumbnail: 'https://images.unsplash.com/photo-1540573133985-87b24b1aecce?auto=format&w=400'
  },
  {
    sku: 'TE-09',
    title: 'Tấm Teak cao cấp',
    species: 'Teak',
    grade: 'AA',
    moisture: '10%',
    dims: '3000 × 450 × 25 mm',
    price: 1500000,
    unit: 'tấm',
    stock: { available: 48, reserved: 22 },
    certifications: [],
    thumbnail: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&w=400'
  },
  {
    sku: 'GO-06',
    title: 'Gõ đỏ veneer',
    species: 'Gõ đỏ',
    grade: 'B',
    moisture: '12%',
    dims: '2200 × 300 × 30 mm',
    price: 1950000,
    unit: 'tấm',
    stock: { available: 32, reserved: 12 },
    certifications: ['FSC'],
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&w=400'
  },
  {
    sku: 'PINE-01',
    title: 'Gỗ thông ghép',
    species: 'Gỗ thông',
    grade: 'Select',
    moisture: '9%',
    dims: '3600 × 400 × 18 mm',
    price: 820000,
    unit: 'tấm',
    stock: { available: 64, reserved: 10 },
    certifications: [],
    thumbnail: 'https://images.unsplash.com/photo-1505692794400-1ba118e01d1c?auto=format&w=400'
  },
  {
    sku: 'SOI-WB',
    title: 'Sồi trắng premium',
    species: 'Sồi trắng',
    grade: 'Premium',
    moisture: '7%',
    dims: '2600 × 300 × 22 mm',
    price: 1780000,
    unit: 'tấm',
    stock: { available: 28, reserved: 14 },
    certifications: ['FSC'],
    thumbnail: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&w=400'
  },
  {
    sku: 'TE-RAW',
    title: 'Teak nguyên khối 40mm',
    species: 'Teak',
    grade: 'AA',
    moisture: '11%',
    dims: '3200 × 500 × 40 mm',
    price: 3650000,
    unit: 'tấm',
    stock: { available: 10, reserved: 4 },
    certifications: ['FSC'],
    thumbnail: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&w=400'
  },
  {
    sku: 'GO-LVT',
    title: 'Gõ mật lát sàn',
    species: 'Gõ mật',
    grade: 'A',
    moisture: '8%',
    dims: '1800 × 250 × 18 mm',
    price: 1450000,
    unit: 'm²',
    stock: { available: 56, reserved: 20 },
    certifications: [],
    thumbnail: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&w=400'
  },
  {
    sku: 'PINE-KD',
    title: 'Thông NZ kiln-dried',
    species: 'Thông NZ',
    grade: 'KD',
    moisture: '10%',
    dims: '3000 × 300 × 25 mm',
    price: 960000,
    unit: 'tấm',
    stock: { available: 80, reserved: 16 },
    certifications: ['FSC'],
    thumbnail: 'https://images.unsplash.com/photo-1469478717963-2fa741d33c8f?auto=format&w=400'
  },
  {
    sku: 'SOI-HV',
    title: 'Sồi hun xử lý nhiệt',
    species: 'Sồi hun',
    grade: 'AA',
    moisture: '8%',
    dims: '2100 × 180 × 15 mm',
    price: 1380000,
    unit: 'm²',
    stock: { available: 90, reserved: 15 },
    certifications: [],
    thumbnail: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&w=401'
  },
  {
    sku: 'TEK-PLY',
    title: 'Teak plywood Marine',
    species: 'Teak',
    grade: 'Marine',
    moisture: '9%',
    dims: '2440 × 1220 × 18 mm',
    price: 1120000,
    unit: 'tấm',
    stock: { available: 150, reserved: 40 },
    certifications: ['FSC'],
    thumbnail: 'https://images.unsplash.com/photo-1472157592780-9d0bca4b3464?auto=format&w=400'
  }
]

const INITIAL_INVENTORY: InventoryItem[] = [
  { sku: 'SOI-A1', species: 'Sồi đỏ', grade: 'A1', available: 120, reserved: 35, safety: 80 },
  { sku: 'TE-09', species: 'Teak', grade: 'AA', available: 48, reserved: 22, safety: 60 },
  { sku: 'GO-06', species: 'Gõ đỏ', grade: 'B', available: 32, reserved: 12, safety: 30 },
  { sku: 'PINE-01', species: 'Gỗ thông', grade: 'Select', available: 64, reserved: 10, safety: 40 },
  { sku: 'SOI-WB', species: 'Sồi trắng', grade: 'Premium', available: 28, reserved: 14, safety: 25 }
]

const CERTIFICATES: Certificate[] = [
  { id: 'cert_001', type: 'FSC', status: 'valid', expires: '30/08/2026', linkedSkus: ['SOI-A1', 'TE-09'] },
  { id: 'cert_002', type: 'FSC', status: 'expired', expires: '31/12/2025', linkedSkus: ['GO-06'] }
]

const REVENUE_SERIES = [
  { label: '01/01', value: 80 },
  { label: '02/01', value: 60 },
  { label: '03/01', value: 95 },
  { label: '04/01', value: 70 },
  { label: '05/01', value: 88 },
  { label: '06/01', value: 100 }
]

const TOP_PRODUCTS = [
  { sku: 'TE-09', label: 'Teak cao cấp', revenue: '₫56.000.000', growth: '+14%' },
  { sku: 'SOI-A1', label: 'Sồi đỏ ghép', revenue: '₫42.000.000', growth: '+8%' },
  { sku: 'GO-06', label: 'Gõ đỏ veneer', revenue: '₫33.500.000', growth: '+5%' }
]

const COMPONENT_LIBRARY = [
  { name: 'Button', props: 'variant, size, icon, loading', states: 'default / hover / active / disabled' },
  { name: 'Input & Select', props: 'label, hint, error, prefix', states: 'focus ring, error message' },
  { name: 'Badge & Chip', props: 'tone, icon', states: 'info / warning / danger / success' },
  { name: 'DataTable', props: 'virtualized, selectionMode, rowActions', states: 'loading / inline edit / empty' },
  { name: 'Modal', props: 'size, destructive, aria-label', states: 'open / confirm / cancel' },
  { name: 'Stepper', props: 'currentIndex, status per step', states: 'complete / active / error' },
  { name: 'FileUploader', props: 'accept, progress, errorList', states: 'idle / drag-over / uploading / error' },
  { name: 'Toast', props: 'type, undo action', states: 'info / success / warning' }
]

const PROTOTYPE_FLOWS = [
  {
    name: 'Chấp nhận & tạo lô hàng',
    steps: ['Chọn tile SLA → lọc Orders', 'Chọn nhiều đơn và chấp nhận', 'Mở modal tạo lô hàng', 'In nhãn và chia sẻ tracking']
  },
  {
    name: 'Cut-to-size configurator',
    steps: ['Nhập chiều dài/rộng/dày', 'Hệ thống validate & tính thể tích', 'Tự động tính giá & ETA', 'Xuất phụ phí oversize nếu có']
  },
  {
    name: 'Bulk CSV upload',
    steps: ['Chọn tệp CSV', 'Xác thực + hiển thị lỗi', 'Tạo báo cáo lỗi tải xuống', 'Áp dụng thay đổi hợp lệ']
  },
  {
    name: 'Tranh chấp & bằng chứng',
    steps: ['Flag tranh chấp trong bảng', 'Xem timeline + ảnh', 'Đính kèm bằng chứng mới', 'Gửi phản hồi khách hàng']
  }
]

const API_ENDPOINTS = [
  { method: 'GET', path: '/orders', note: 'Danh sách đơn (status, flags, SLA)' },
  { method: 'GET', path: '/orders/{id}', note: 'Chi tiết đơn + timeline + tranh chấp' },
  { method: 'POST', path: '/orders/{id}/accept', note: 'Chấp nhận / cập nhật SLA' },
  { method: 'POST', path: '/shipments', note: 'Tạo lô hàng + nhãn' },
  { method: 'GET', path: '/listings', note: 'Danh sách SKU + tồn kho' },
  { method: 'POST', path: '/listings', note: 'Tạo/chỉnh sửa listing' },
  { method: 'POST', path: '/listings/import', note: 'Bulk CSV, trả về lỗi hàng' },
  { method: 'GET', path: '/inventory', note: 'Tồn kho SKU + reserved' },
  { method: 'POST', path: '/inventory/adjustments', note: 'Điều chỉnh tồn kho' },
  { method: 'GET', path: '/compliance/certificates', note: 'Chứng nhận + ngày hết hạn' },
  { method: 'POST', path: '/certificates/upload', note: 'Tải chứng nhận (PDF/JPG)' },
  { method: 'GET', path: '/reports', note: 'Doanh thu, top SKU, hoàn trả' },
  { method: 'GET', path: '/payouts', note: 'Số dư, giao dịch' }
]

const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

const calculateConfiguratorPreview = (inputs: ConfiguratorInputs): ConfiguratorPreview => {
  const { length, width, thickness } = inputs
  const volume = (length * width * thickness) / 1000000000
  const basePrice = Math.max(450000, Math.round(volume * 42000000))
  const etaDays = length > 3200 || width > 600 ? 4 : 2
  const surchargeNote = length > 3200 ? 'Phụ phí oversize +₫450.000 & cần 2 người nâng' : undefined
  let warning: string | undefined
  if (length < 400 || width < 80 || thickness < 12) warning = 'Thông số dưới mức tối thiểu hỗ trợ'
  if (length > 3600 || width > 800) warning = 'Vượt giới hạn tiêu chuẩn, cần xác nhận LTL'
  return { price: formatCurrency(basePrice), eta: `${etaDays} ngày`, surchargeNote, warning }
}

type BulkSnapshot = { id: string; status: string; statusKey: OrderStatusKey }

export default function SellerDashboard() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [orderFilter, setOrderFilter] = useState<string>('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [activeOrderId, setActiveOrderId] = useState<string>(INITIAL_ORDERS[0].id)
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS)
  const [lastEditedListing, setLastEditedListing] = useState<string | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY)
  const [csvResult, setCsvResult] = useState<{ fileName?: string; success?: number; failed?: number }>({})
  const [configInputs, setConfigInputs] = useState<ConfiguratorInputs>({ length: 3000, width: 450, thickness: 25 })
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false)
  const [toastSnapshot, setToastSnapshot] = useState<BulkSnapshot[] | null>(null)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [certificateUpload, setCertificateUpload] = useState<string>('')

  const configPreview = useMemo(() => calculateConfiguratorPreview(configInputs), [configInputs])
  const filteredOrders = useMemo(
    () =>
      orderFilter === 'all'
        ? orders
        : orders.filter(order => order.statusKey === orderFilter || order.workKey === orderFilter),
    [orderFilter, orders]
  )

  const activeOrder = orders.find(order => order.id === activeOrderId) ?? orders[0]
  const lowStockAlerts = useMemo(() => inventory.filter(item => item.available < item.safety), [inventory])

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => (prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]))
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
      return
    }
    setSelectedOrders(filteredOrders.map(order => order.id))
  }

  const handleBulkAccept = () => {
    if (!selectedOrders.length) return
    const snapshot = orders
      .filter(order => selectedOrders.includes(order.id))
      .map(order => ({ id: order.id, status: order.status, statusKey: order.statusKey }))
    setOrders(prev =>
      prev.map(order =>
        selectedOrders.includes(order.id)
          ? { ...order, status: 'Đang chuẩn bị', statusKey: 'processing', workKey: 'pack_today' }
          : order
      )
    )
    setToastSnapshot(snapshot)
    setToastMessage(`Đã chấp nhận ${selectedOrders.length} đơn`)
    setSelectedOrders([])
  }

  const handleUndo = () => {
    if (!toastSnapshot?.length) {
      setToastMessage('')
      return
    }
    setOrders(prev =>
      prev.map(order => {
        const prevState = toastSnapshot.find(snapshot => snapshot.id === order.id)
        return prevState ? { ...order, status: prevState.status, statusKey: prevState.statusKey } : order
      })
    )
    setToastSnapshot(null)
    setToastMessage('')
  }

  const handleShipmentConfirm = (payload: { carrier: string; service: string; notes: string }) => {
    setShipmentModalOpen(false)
    setToastSnapshot(null)
    setToastMessage(`Đã tạo lô hàng ${payload.carrier.toUpperCase()} (${payload.service})`)
    setSelectedOrders([])
  }

  const handleListingPriceChange = (sku: string, value: number) => {
    if (Number.isNaN(value) || value <= 0) return
    setListings(prev => prev.map(listing => (listing.sku === sku ? { ...listing, price: value } : listing)))
    setLastEditedListing(sku)
    window.setTimeout(() => setLastEditedListing(null), 3000)
  }

  const handleCsvUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCsvResult({ fileName: file.name, success: 8, failed: 1 })
    event.target.value = ''
  }

  const handleConfiguratorChange = (field: keyof ConfiguratorInputs, value: number) => {
    if (Number.isNaN(value)) return
    setConfigInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleInventoryAdjust = (sku: string, delta: number) => {
    setInventory(prev =>
      prev.map(item => (item.sku === sku ? { ...item, available: Math.max(0, item.available + delta) } : item))
    )
  }

  const handleCertificateUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCertificateUpload(file.name)
    event.target.value = ''
  }

  return (
    <div className='seller-dashboard'>
      <aside className='seller-dashboard__sidebar'>
        <div className='seller-dashboard__brand'>GỗPlus Seller</div>
        <nav aria-label='Seller navigation'>
          <ul>
            {NAV_ITEMS.map(item => (
              <li key={item.key} className={item.key === 'dashboard' ? 'is-active' : undefined}>
                <button type='button'>{item.label}</button>
              </li>
            ))}
          </ul>
        </nav>
        <div className='seller-dashboard__sidebar-footer'>
          <p>Trực tuyến • GMT+7</p>
          <p>Hỗ trợ 24/7 | <a href='mailto:seller@goplus.vn'>seller@goplus.vn</a></p>
        </div>
      </aside>

      <main className='seller-dashboard__content'>
        <header className='seller-dashboard__header'>
          <div>
            <p className='eyebrow'>Armchair Marketplace • Wood specialist</p>
            <h1>Dashboard người bán</h1>
          </div>
          <div className='seller-dashboard__header-actions'>
            <button type='button' className='seller-btn seller-btn--ghost'>Tạo thông báo</button>
            <button type='button' className='seller-btn'>Đăng sản phẩm mới</button>
          </div>
        </header>

        <section className='seller-card seller-card--grid'>
          {KPI_DATA.map(kpi => (
            <div key={kpi.label} className='kpi-card'>
              <div className='kpi-card__meta'>
                <span>{kpi.label}</span>
                {kpi.live && <span className='live-dot' aria-label='Đang cập nhật' />}
              </div>
              <strong>{kpi.value}</strong>
              <p>{kpi.delta}</p>
            </div>
          ))}
        </section>

        <section className='seller-layout seller-layout--two-cols'>
          <div className='seller-card'>
            <div className='section-heading'>
              <h2>Danh sách cần làm</h2>
              <span>Chạm để lọc Orders</span>
            </div>
            <div className='worklist-grid'>
              {WORKLIST.map(tile => (
                <button
                  key={tile.id}
                  type='button'
                  className={`worklist-tile worklist-tile--${tile.severity}`}
                  onClick={() => setOrderFilter(tile.filterKey)}
                >
                  <div className='worklist-tile__count'>{tile.count}</div>
                  <div>
                    <p>{tile.label}</p>
                    <small>SLA {tile.deadline}</small>
                  </div>
                </button>
              ))}
            </div>
            <div className='seller-quick-actions'>
              <button type='button' className='seller-btn seller-btn--ghost'>Tạo lô hàng</button>
              <button type='button' className='seller-btn seller-btn--ghost'>Xuất báo cáo</button>
              <button type='button' className='seller-btn seller-btn--ghost'>Thêm nhân viên</button>
            </div>
          </div>

          <div className='seller-card seller-card--stacked'>
            <div className='section-heading'>
              <h2>Doanh thu 6 ngày gần nhất</h2>
              <span aria-live='polite' className='live-indicator'>Đang cập nhật...</span>
            </div>
            <div className='seller-chart' role='img' aria-label='Doanh thu 6 ngày'>
              {REVENUE_SERIES.map(point => (
                <div key={point.label} className='seller-chart__bar' style={{ height: `${point.value}%` }}>
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
            <div className='top-products'>
              {TOP_PRODUCTS.map(product => (
                <div key={product.sku} className='top-products__item'>
                  <div>
                    <strong>{product.label}</strong>
                    <p>{product.revenue}</p>
                  </div>
                  <span>{product.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='seller-layout seller-layout--two-cols' id='orders'>
          <div className='seller-card seller-card--table'>
            <div className='section-heading'>
              <h2>Orders</h2>
              <div className='chip-row' role='tablist'>
                {ORDER_FILTERS.map(filter => (
                  <button
                    key={filter.key}
                    type='button'
                    role='tab'
                    aria-selected={orderFilter === filter.key}
                    className={`seller-chip ${orderFilter === filter.key ? 'is-active' : ''}`}
                    onClick={() => setOrderFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className='table-actions'>
              <div className='selection'>
                <label>
                  <input
                    type='checkbox'
                    aria-label='Chọn tất cả'
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>{selectedOrders.length} đã chọn</span>
                </label>
              </div>
              <div className='bulk-actions'>
                <button
                  type='button'
                  className='seller-btn'
                  disabled={!selectedOrders.length}
                  onClick={handleBulkAccept}
                >
                  Chấp nhận đơn
                </button>
                <button
                  type='button'
                  className='seller-btn seller-btn--ghost'
                  disabled={!selectedOrders.length}
                  onClick={() => setShipmentModalOpen(true)}
                >
                  Tạo lô hàng
                </button>
              </div>
            </div>
            <div className='seller-table' role='table' aria-label='Danh sách đơn' data-virtualized='true'>
              <div className='seller-table__head' role='rowgroup'>
                <div role='row'>
                  <span />
                  <span>Order ID</span>
                  <span>Khách</span>
                  <span>Sản phẩm</span>
                  <span>Flags</span>
                  <span>SLA</span>
                  <span>Tổng</span>
                  <span>Cập nhật</span>
                </div>
              </div>
              <div className='seller-table__body' role='rowgroup'>
                {filteredOrders.map(order => (
                  <div
                    role='row'
                    key={order.id}
                    className={activeOrderId === order.id ? 'is-active' : undefined}
                    onClick={() => setActiveOrderId(order.id)}
                  >
                    <span>
                      <input
                        type='checkbox'
                        aria-label={`Chọn ${order.id}`}
                        checked={selectedOrders.includes(order.id)}
                        onChange={event => {
                          event.stopPropagation()
                          toggleSelectOrder(order.id)
                        }}
                      />
                    </span>
                    <span>
                      <strong>{order.id}</strong>
                      <span className={`status-pill status-pill--${order.statusKey}`}>{order.status}</span>
                    </span>
                    <span>
                      <p>{order.buyer}</p>
                      <small>{order.shippingProfile}</small>
                    </span>
                    <span>
                      <p>{order.species}</p>
                      <small>
                        {order.grade} • {order.moisture}
                      </small>
                    </span>
                    <span className='flag-list'>
                      {order.flags.length ? order.flags.map(flag => <span key={flag}>{flag}</span>) : '—'}
                    </span>
                    <span>{order.slaMinutes ? `${order.slaMinutes}p` : '—'}</span>
                    <span>{formatCurrency(order.value)}</span>
                    <span>{order.updatedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='seller-card seller-card--detail'>
            <h2>Chi tiết đơn</h2>
            <div className='order-header'>
              <div>
                <p className='eyebrow'>OrderID</p>
                <strong>{activeOrder.id}</strong>
              </div>
              <span className={`status-pill status-pill--${activeOrder.statusKey}`}>{activeOrder.status}</span>
            </div>
            <div className='order-meta'>
              <div>
                <p>Khách hàng</p>
                <strong>{activeOrder.buyer}</strong>
                <small>Shipping: {activeOrder.shippingProfile}</small>
              </div>
              <div>
                <p>Thông số</p>
                <strong>
                  {activeOrder.species} • {activeOrder.grade}
                </strong>
                <small>
                  {activeOrder.dimensions} • {activeOrder.moisture}
                </small>
              </div>
            </div>
            <div className='order-actions'>
              <button type='button' className='seller-btn'>Chấp nhận</button>
              <button type='button' className='seller-btn seller-btn--ghost'>Từ chối</button>
              <button type='button' className='seller-btn seller-btn--ghost'>In phiếu</button>
              <button type='button' className='seller-btn seller-btn--ghost'>Tạo trả hàng</button>
            </div>
            <div className='timeline' role='list'>
              {activeOrder.timeline.map(event => (
                <div key={`${event.at}-${event.label}`} role='listitem'>
                  <span>{event.at}</span>
                  <div>
                    <strong>{event.label}</strong>
                    <p>{event.note}</p>
                    <small>{event.actor}</small>
                    {event.attachments && (
                      <div className='attachment-row'>
                        {event.attachments.map(file => (
                          <span key={file.name}>{file.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {activeOrder.statusKey === 'dispute' && (
              <div className='dispute-panel'>
                <h3>Tranh chấp & bằng chứng</h3>
                <p>Phản hồi trong vòng 24h để tránh phạt SLA.</p>
                <button type='button' className='seller-btn seller-btn--ghost'>Xem thư khách</button>
                <button type='button' className='seller-btn seller-btn--ghost'>Tải thêm bằng chứng</button>
              </div>
            )}
          </div>
        </section>

        <section className='seller-layout seller-layout--two-cols' id='listings'>
          <div className='seller-card seller-card--table'>
            <div className='section-heading'>
              <h2>Listings</h2>
              <div className='listing-actions'>
                <button type='button' className='seller-btn'>Đăng sản phẩm</button>
                <label className='seller-btn seller-btn--ghost'>
                  Tải lên CSV
                  <input type='file' accept='.csv' onChange={handleCsvUpload} />
                </label>
              </div>
            </div>
            {csvResult.fileName && (
              <div className='upload-summary' role='status'>
                <strong>{csvResult.fileName}</strong>
                <span>{csvResult.success} thành công • {csvResult.failed} lỗi</span>
                <button type='button' className='seller-btn seller-btn--ghost'>Tải lỗi (.csv)</button>
              </div>
            )}
            <div className='seller-table seller-table--listings'>
              <div className='seller-table__head'>
                <div>
                  <span>Sản phẩm</span>
                  <span>SKU</span>
                  <span>Thông số</span>
                  <span>Tồn (Avail/Res)</span>
                  <span>Giá</span>
                  <span>Chứng nhận</span>
                </div>
              </div>
              <div className='seller-table__body'>
                {listings.map(listing => (
                  <div key={listing.sku}>
                    <span className='listing-cell'>
                      <img src={listing.thumbnail} alt={listing.title} loading='lazy' />
                      <div>
                        <strong>{listing.title}</strong>
                        <small>{listing.species}</small>
                      </div>
                    </span>
                    <span>{listing.sku}</span>
                    <span>
                      {listing.grade} • {listing.moisture}
                      <br />
                      {listing.dims}
                    </span>
                    <span>
                      {listing.stock.available}/{listing.stock.reserved}
                    </span>
                    <span>
                      <input
                        type='number'
                        value={listing.price}
                        min={100000}
                        onChange={event => handleListingPriceChange(listing.sku, Number(event.target.value))}
                      />
                      <small>{listing.unit}</small>
                      {lastEditedListing === listing.sku && <em>Đã lưu</em>}
                    </span>
                    <span className='flag-list'>
                      {listing.certifications.length ? listing.certifications.map(cert => <span key={cert}>{cert}</span>) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='seller-card seller-card--wizard'>
            <h2>Listing Wizard</h2>
            <ol className='stepper'>
              {['Thông tin cơ bản', 'Thông số kỹ thuật', 'Giá & tồn', 'Media', 'Vận chuyển & dịch vụ', 'Đăng'].map((step, index) => (
                <li key={step} className={index <= 2 ? 'is-complete' : index === 3 ? 'is-active' : ''}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <div className='configurator'>
              <div>
                <label>
                  Chiều dài (mm)
                  <input
                    type='number'
                    min={400}
                    max={4000}
                    value={configInputs.length}
                    onChange={event => handleConfiguratorChange('length', Number(event.target.value))}
                  />
                </label>
                <label>
                  Chiều rộng (mm)
                  <input
                    type='number'
                    min={80}
                    max={800}
                    value={configInputs.width}
                    onChange={event => handleConfiguratorChange('width', Number(event.target.value))}
                  />
                </label>
                <label>
                  Độ dày (mm)
                  <input
                    type='number'
                    min={12}
                    max={60}
                    value={configInputs.thickness}
                    onChange={event => handleConfiguratorChange('thickness', Number(event.target.value))}
                  />
                </label>
              </div>
              <div className='configurator__summary'>
                <p>Giá tạm tính</p>
                <strong>{configPreview.price}</strong>
                <p>ETA: {configPreview.eta}</p>
                {configPreview.surchargeNote && <small>{configPreview.surchargeNote}</small>}
                {configPreview.warning && <small className='warning'>{configPreview.warning}</small>}
              </div>
            </div>
            <div className='media-uploader'>
              <label>
                Kéo thả hình ảnh (JPG/PNG)
                <input type='file' accept='image/*' multiple />
              </label>
              <button type='button' className='seller-btn seller-btn--ghost'>Xem trước PDP</button>
            </div>
          </div>
        </section>

        <section className='seller-layout seller-layout--two-cols' id='inventory'>
          <div className='seller-card seller-card--table'>
            <div className='section-heading'>
              <h2>Inventory</h2>
              <div className='seller-chip-row'>
                <button type='button' className='seller-btn seller-btn--ghost'>Xuất CSV</button>
                <button type='button' className='seller-btn seller-btn--ghost'>Lọc thấp hơn an toàn</button>
              </div>
            </div>
            <div className='seller-table'>
              <div className='seller-table__head'>
                <div>
                  <span>SKU</span>
                  <span>Species</span>
                  <span>Grade</span>
                  <span>Avail</span>
                  <span>Reserved</span>
                  <span>An toàn</span>
                  <span>Điều chỉnh</span>
                </div>
              </div>
              <div className='seller-table__body'>
                {inventory.map(item => (
                  <div key={item.sku}>
                    <span>{item.sku}</span>
                    <span>{item.species}</span>
                    <span>{item.grade}</span>
                    <span>{item.available}</span>
                    <span>{item.reserved}</span>
                    <span>{item.safety}</span>
                    <span>
                      <button type='button' onClick={() => handleInventoryAdjust(item.sku, -5)}>-5</button>
                      <button type='button' onClick={() => handleInventoryAdjust(item.sku, 5)}>+5</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className='alert-panel'>
              <h3>Tồn kho dưới ngưỡng</h3>
              <ul>
                {lowStockAlerts.map(item => (
                  <li key={item.sku}>
                    <strong>{item.sku}</strong> còn {item.available} (ngưỡng {item.safety})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='seller-card seller-card--stacked'>
            <h2>Fulfillment & Shipping</h2>
            <div className='fulfillment-cards'>
              <article>
                <h3>Pick/Pack list</h3>
                <p>6 đơn cần đóng gói trước 14:00. Ưu tiên GH-240105-003 (ưu tiên).</p>
                <button type='button' className='seller-btn seller-btn--ghost'>In pick list</button>
              </article>
              <article>
                <h3>Cấu hình vận chuyển</h3>
                <p>White-glove • pickup window 15:00-17:00 • yêu cầu 2 người.</p>
                <button type='button' className='seller-btn seller-btn--ghost'>Sửa profile</button>
              </article>
              <article>
                <h3>Nhật ký lô hàng</h3>
                <p>02 lô hàng đang chờ nhãn. Đồng bộ với carrier qua API.</p>
                <button type='button' className='seller-btn seller-btn--ghost'>Xem chi tiết</button>
              </article>
            </div>
          </div>
        </section>

        <section className='seller-layout seller-layout--two-cols' id='compliance'>
          <div className='seller-card seller-card--certs'>
            <div className='section-heading'>
              <h2>Chứng nhận & KYC</h2>
              <label className='seller-btn seller-btn--ghost'>
                Tải chứng nhận
                <input type='file' accept='.pdf,.jpg,.png' onChange={handleCertificateUpload} />
              </label>
            </div>
            {certificateUpload && <p role='status'>Đã chọn: {certificateUpload}</p>}
            <div className='certificate-list'>
              {CERTIFICATES.map(cert => (
                <article key={cert.id} className={`certificate-card status-${cert.status}`}>
                  <div>
                    <h3>{cert.type}</h3>
                    <p>Hết hạn: {cert.expires}</p>
                    <p>SKU: {cert.linkedSkus.join(', ')}</p>
                  </div>
                  <span>{cert.status === 'valid' ? 'Còn hiệu lực' : 'Hết hạn'}</span>
                </article>
              ))}
            </div>
          </div>

          <div className='seller-card seller-card--stacked'>
            <h2>Component Library & Tokens</h2>
            <div className='token-grid'>
              <div>
                <h3>Màu sắc</h3>
                <ul>
                  <li><span className='token-swatch' style={{ background: '#1E86A6' }} />Accent #1E86A6</li>
                  <li><span className='token-swatch' style={{ background: '#2F8F5B' }} />Success #2F8F5B</li>
                  <li><span className='token-swatch' style={{ background: '#D9822B' }} />Warning #D9822B</li>
                  <li><span className='token-swatch' style={{ background: '#C7443E' }} />Danger #C7443E</li>
                </ul>
              </div>
              <div>
                <h3>Typography</h3>
                <p>Heading: Inter 600, 24px</p>
                <p>Body: Inter 400, 14/16px</p>
                <p>Number: Tabular lining</p>
              </div>
              <div>
                <h3>Spacing</h3>
                <p>XS 4px • SM 8px • MD 16px • LG 24px • XL 32px</p>
                <p>Radius: 4px / 8px / pill</p>
              </div>
            </div>
            <div className='component-table'>
              {COMPONENT_LIBRARY.map(component => (
                <article key={component.name}>
                  <h4>{component.name}</h4>
                  <p>Props: {component.props}</p>
                  <p>States: {component.states}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='seller-card seller-card--stacked' id='developer-handoff'>
          <div className='section-heading'>
            <h2>Prototype flows & API handoff</h2>
            <span>GMT+7 • dữ liệu mẫu VND</span>
          </div>
          <div className='prototype-grid'>
            {PROTOTYPE_FLOWS.map(flow => (
              <article key={flow.name}>
                <h3>{flow.name}</h3>
                <ol>
                  {flow.steps.map(step => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <div className='api-spec'>
            <h3>API tối thiểu</h3>
            <ul>
              {API_ENDPOINTS.map(endpoint => (
                <li key={endpoint.path + endpoint.method}>
                  <code>
                    {endpoint.method} {endpoint.path}
                  </code>
                  <span>{endpoint.note}</span>
                </li>
              ))}
            </ul>
            <pre>
{`GET /orders → {
  "items": [{
    "id": "GH-240105-001",
    "status": "pending",
    "flags": ["oversize"],
    "dimensions": "3000x450x25",
    "moisture": "10%",
    "certifications": ["FSC"]
  }]
}`}
            </pre>
          </div>
        </section>

        {toastMessage && (
          <div className='seller-toast' role='status' aria-live='assertive'>
            <span>{toastMessage}</span>
            {toastSnapshot && toastSnapshot.length > 0 && (
              <button type='button' onClick={handleUndo}>
                Hoàn tác
              </button>
            )}
            {!toastSnapshot && (
              <button type='button' onClick={() => setToastMessage('')}>Đóng</button>
            )}
          </div>
        )}
      </main>

      <ShipmentModal
        open={shipmentModalOpen}
        onClose={() => setShipmentModalOpen(false)}
        selectedOrders={orders.filter(order => selectedOrders.includes(order.id))}
        onConfirm={handleShipmentConfirm}
      />
    </div>
  )
}

interface ShipmentModalProps {
  open: boolean
  onClose: () => void
  selectedOrders: Order[]
  onConfirm: (payload: { carrier: string; service: string; notes: string }) => void
}

function ShipmentModal({ open, onClose, selectedOrders, onConfirm }: ShipmentModalProps) {
  const [carrier, setCarrier] = useState('logi-express')
  const [service, setService] = useState('white-glove')
  const [notes, setNotes] = useState('Ưu tiên lấy hàng trước 16:00')

  if (!open) return null

  return (
    <div className='seller-modal' role='dialog' aria-modal='true'>
      <div className='seller-modal__content'>
        <header>
          <h2>Tạo lô hàng ({selectedOrders.length} đơn)</h2>
          <button type='button' onClick={onClose} aria-label='Đóng'>×</button>
        </header>
        <div className='seller-modal__body'>
          <label>
            Carrier
            <select value={carrier} onChange={event => setCarrier(event.target.value)}>
              <option value='logi-express'>Logi Express</option>
              <option value='ltl-partner'>Đối tác LTL</option>
              <option value='white-glove-team'>Đội white-glove nội bộ</option>
            </select>
          </label>
          <label>
            Dịch vụ
            <select value={service} onChange={event => setService(event.target.value)}>
              <option value='white-glove'>White-glove</option>
              <option value='ltl'>LTL</option>
              <option value='standard'>Tiêu chuẩn</option>
            </select>
          </label>
          <label>
            Ghi chú cho kho
            <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} />
          </label>
          <div className='modal-summary'>
            {selectedOrders.map(order => (
              <p key={order.id}>
                {order.id} • {order.species} ({order.flags.join(', ') || 'Standard'})
              </p>
            ))}
          </div>
        </div>
        <footer>
          <button type='button' className='seller-btn seller-btn--ghost' onClick={onClose}>
            Huỷ
          </button>
          <button
            type='button'
            className='seller-btn'
            onClick={() => onConfirm({ carrier, service, notes })}
          >
            Tạo & in nhãn
          </button>
        </footer>
      </div>
    </div>
  )
}
