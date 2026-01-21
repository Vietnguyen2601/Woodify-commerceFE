/**
 * Order related types
 */

export type OrderStatusKey = 
  | 'pending' 
  | 'quote' 
  | 'processing' 
  | 'packing' 
  | 'shipping' 
  | 'delivered' 
  | 'dispute' 
  | 'cancelled'

export type WorkKey = 
  | 'await_confirm' 
  | 'send_quote' 
  | 'pack_today' 
  | 'prepare_ship' 
  | 'dispute'

export interface TimelineEvent {
  at: string
  actor: string
  label: string
  note?: string
  attachments?: OrderAttachment[]
}

export interface OrderAttachment {
  name: string
  type: string
}

export interface Order {
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

export interface OrderFilters {
  status?: OrderStatusKey
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface WorkTile {
  id: WorkKey
  label: string
  count: number
  deadline: string
  severity: 'high' | 'medium' | 'low'
  filterKey: OrderStatusKey | WorkKey | 'all'
}
