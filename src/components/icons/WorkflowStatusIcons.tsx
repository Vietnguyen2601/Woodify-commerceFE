import AssetIcon from '@/components/AssetIcon'
import allIcon from '@/assets/icons/essential/workflow/all.svg'
import pendingIcon from '@/assets/icons/essential/workflow/pending.svg'
import approvedIcon from '@/assets/icons/essential/workflow/approved.svg'
import publishedIcon from '@/assets/icons/essential/workflow/published.svg'
import rejectedIcon from '@/assets/icons/essential/workflow/rejected.svg'

/**
 * Icon workflow ALL / Pending / Approved / Published / Rejected
 * — file SVG trong `assets/icons/essential/workflow/` (cùng format essential: 24px, stroke currentColor).
 * — hiển thị qua `AssetIcon` (import .svg → URL), dùng className filter hoặc opacity theo theme.
 */

export type WorkflowStatusIconKey = 'ALL' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'

export const WORKFLOW_STATUS_ICON_SRC: Record<WorkflowStatusIconKey, string> = {
  ALL: allIcon,
  PENDING: pendingIcon,
  APPROVED: approvedIcon,
  PUBLISHED: publishedIcon,
  REJECTED: rejectedIcon,
}

/** Gợi ý class Tailwind khi dùng kèm filter từ `currentColor` (img URL không kế thừa text color). */
export const WORKFLOW_STATUS_ICON_TONE: Record<WorkflowStatusIconKey, string> = {
  ALL: 'text-stone-600',
  PENDING: 'text-amber-600',
  APPROVED: 'text-sky-600',
  PUBLISHED: 'text-emerald-600',
  REJECTED: 'text-red-600',
}

const ALT: Record<WorkflowStatusIconKey, string> = {
  ALL: 'Tất cả',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PUBLISHED: 'Đã xuất bản',
  REJECTED: 'Từ chối',
}

type WorkflowStatusIconProps = {
  status: WorkflowStatusIconKey
  width?: number
  height?: number
  className?: string
  /** Nếu true: truyền alt cho img (NVDA đọc). Mặc định decorative. */
  labeled?: boolean
}

export function WorkflowStatusIcon({
  status,
  width = 18,
  height = 18,
  className = '',
  labeled = false,
}: WorkflowStatusIconProps) {
  return (
    <AssetIcon
      src={WORKFLOW_STATUS_ICON_SRC[status]}
      alt={labeled ? ALT[status] : ''}
      width={width}
      height={height}
      className={className}
    />
  )
}
