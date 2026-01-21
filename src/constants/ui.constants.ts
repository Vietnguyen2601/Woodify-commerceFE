/**
 * UI constants and configuration
 */

// Breakpoints (matching useMediaQuery)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

// Form validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[0-9]{10,11}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// Toast/notification durations
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
} as const

// Order status labels (Vietnamese)
export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  quote: 'Chờ báo giá',
  processing: 'Đang chuẩn bị',
  packing: 'Đóng gói',
  shipping: 'Chờ vận chuyển',
  delivered: 'Đã giao',
  dispute: 'Tranh chấp',
  cancelled: 'Đã huỷ',
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
} as const
