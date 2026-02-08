import React from 'react'

const iconPaths = {
  'search': (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M16.5 16.5L21 21" />
    </>
  ),
  'shopping-cart': (
    <>
      <path d="M3 5H6L7.8 15H18.5L21 7H6.5" />
      <circle cx="10" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </>
  ),
  'user': (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20C4 15.582 7.582 12 12 12C16.418 12 20 15.582 20 20" />
    </>
  ),
  'heart': (
    <path d="M12 20L5.5 13.5C3.5 11.5 3.5 8.2 5.7 6.2C7.3 4.8 9.9 4.9 11.4 6.4L12 7L12.6 6.4C14.1 4.9 16.7 4.8 18.3 6.2C20.5 8.2 20.5 11.5 18.5 13.5L12 20Z" />
  ),
  'heart-filled': (
    <path d="M12 21L4.8 13.7C2.6 11.5 2.7 7.9 5.1 5.9C6.8 4.5 9.3 4.6 11 6.1L12 7L13 6.1C14.7 4.6 17.2 4.5 18.9 5.9C21.3 7.9 21.4 11.5 19.2 13.7L12 21Z" fill="currentColor" stroke="none" />
  ),
  'menu': (
    <>
      <path d="M4 7H20" />
      <path d="M4 12H20" />
      <path d="M4 17H20" />
    </>
  ),
  'close': (
    <>
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </>
  ),
  'notification-bell': (
    <>
      <path d="M6 17H18L17 15V11C17 7.686 14.314 5 11 5C7.686 5 5 7.686 5 11V15L4 17H6Z" />
      <path d="M9 17C9 18.657 10.343 20 12 20C13.657 20 15 18.657 15 17" />
    </>
  ),
  'notification-dot': (
    <>
      <path d="M6 17H18L17 15V11C17 7.686 14.314 5 11 5C7.686 5 5 7.686 5 11V15L4 17H6Z" />
      <path d="M9 17C9 18.657 10.343 20 12 20C13.657 20 15 18.657 15 17" />
      <circle cx="18" cy="6" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  'phone': (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M10 5H14" />
      <path d="M10 19H14" />
    </>
  ),
  'globe': (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12H20" />
      <path d="M12 4C14.5 6.5 15.8 9.5 15.8 12C15.8 14.5 14.5 17.5 12 20C9.5 17.5 8.2 14.5 8.2 12C8.2 9.5 9.5 6.5 12 4Z" />
      <path d="M6 7.5C7.9 8.3 9.9 8.75 12 8.75C14.1 8.75 16.1 8.3 18 7.5" />
      <path d="M18 16.5C16.1 15.7 14.1 15.25 12 15.25C9.9 15.25 7.9 15.7 6 16.5" />
    </>
  ),
  'logo-placeholder': (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 15L15 9" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  'truck': (
    <>
      <path d="M3 7H14V17H5C3.895 17 3 16.105 3 15V7Z" />
      <path d="M14 11H18L21 14V17H19" />
      <circle cx="7" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </>
  ),
  'shield-check': (
    <>
      <path d="M12 3L5 6V12C5 16.418 8.134 20.364 12 21C15.866 20.364 19 16.418 19 12V6L12 3Z" />
      <path d="M9 12L11 14L15 10" />
    </>
  ),
  'refresh': (
    <>
      <path d="M20 5V10H15" />
      <path d="M4 19V14H9" />
      <path d="M6.5 9C7.6 6.7 9.9 5 12.7 5C15 5 17.1 6 18.5 7.6" />
      <path d="M17.5 15C16.4 17.3 14.1 19 11.3 19C9 19 6.9 18 5.5 16.4" />
    </>
  ),
  'headset': (
    <>
      <path d="M5 14V11C5 7.686 7.686 5 11 5H13C16.314 5 19 7.686 19 11V14" />
      <path d="M5 14H7C8.105 14 9 14.895 9 16V18C9 19.105 8.105 20 7 20H5V14Z" />
      <path d="M19 14H17C15.895 14 15 14.895 15 16V17.5C15 18.604 15.896 19.5 17 19.5H19" />
      <path d="M13 20H11" />
    </>
  ),
  'star': (
    <path d="M12 3.5L14.6 8.8L20.4 9.6L16 13.7L17.2 19.4L12 16.6L6.8 19.4L8 13.7L3.6 9.6L9.4 8.8L12 3.5Z" />
  ),
  'star-filled': (
    <path d="M12 3.5L14.9 8.8L20.8 9.6L16.4 13.6L17.6 19.5L12 16.4L6.4 19.5L7.6 13.6L3.2 9.6L9.1 8.8L12 3.5Z" fill="currentColor" stroke="none" />
  ),
  'tag': (
    <>
      <path d="M3 12L12 3H20V11L11 20L3 12Z" />
      <circle cx="16" cy="8" r="1.5" />
    </>
  ),
  'gift': (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M4 10H20" />
      <path d="M12 4C10.895 4 10 4.895 10 6C10 7.105 10.895 8 12 8C13.105 8 14 7.105 14 6C14 4.895 13.105 4 12 4Z" />
      <path d="M12 8V20" />
      <path d="M7 6C7 4.895 7.895 4 9 4C10.105 4 11 4.895 11 6C11 7.105 10.105 8 9 8C7.895 8 7 7.105 7 6Z" />
      <path d="M17 6C17 4.895 16.105 4 15 4C13.895 4 13 4.895 13 6C13 7.105 13.895 8 15 8C16.105 8 17 7.105 17 6Z" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12H19" />
      <path d="M13 6L19 12L13 18" />
    </>
  ),
  'chevron-right': (
    <path d="M9 5L16 12L9 19" />
  ),
} as const

export type IconName = keyof typeof iconPaths

const defaultTitles: Record<IconName, string> = {
  'search': 'Search',
  'shopping-cart': 'Shopping cart',
  'user': 'User profile',
  'heart': 'Wishlist',
  'heart-filled': 'Wishlist active',
  'menu': 'Menu',
  'close': 'Close',
  'notification-bell': 'Notifications',
  'notification-dot': 'Notifications unread',
  'phone': 'Phone contact',
  'globe': 'Language selector',
  'logo-placeholder': 'Brand mark',
  'truck': 'Fast delivery',
  'shield-check': 'Secure guarantee',
  'refresh': 'Easy returns',
  'headset': 'Customer support',
  'star': 'Rating outline',
  'star-filled': 'Rating filled',
  'tag': 'Price tag',
  'gift': 'Gift box',
  'arrow-right': 'Arrow right',
  'chevron-right': 'Chevron right',
}

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName
  size?: number
  strokeWidth?: number
  decorative?: boolean
  title?: string
}

export function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  decorative = false,
  title,
  className,
  ...rest
}: IconProps) {
  const icon = iconPaths[name]

  if (!icon) {
    return null
  }

  const titleId = React.useId()
  const resolvedTitle = title ?? defaultTitles[name]
  const ariaHidden = decorative ? true : undefined

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={ariaHidden}
      aria-labelledby={decorative ? undefined : titleId}
      className={className}
      {...rest}
    >
      {!decorative && <title id={titleId}>{resolvedTitle}</title>}
      {icon}
    </svg>
  )
}
