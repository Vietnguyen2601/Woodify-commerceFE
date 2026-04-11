import React from 'react'

type AssetIconProps = {
  src: string
  /** Khi rỗng: decorative, ẩn khỏi NVDA */
  alt?: string
  className?: string
  width?: number
  height?: number
}

/** Hiển thị SVG đã import (Vite trả về URL string). */
export default function AssetIcon({ src, alt = '', className = '', width = 18, height = 18 }: AssetIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`shrink-0 object-contain ${className}`}
      aria-hidden={alt ? undefined : true}
    />
  )
}
