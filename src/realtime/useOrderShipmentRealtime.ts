import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ordersHub, type OrderShipmentRealtimePayload } from './ordersHub'
import { SHIP_QUERY_KEY } from '@/pages/seller/orders/shipmentSellerUi'
import type { ShipmentDto, SellerOrder, BuyerOrder } from '@/types'
import { queryKeys } from '@/services'

type Params = {
  shopId?: string | null
  accountId?: string | null
  orderId?: string | null
}

function upper(s: unknown): string {
  return String(s ?? '').trim().toUpperCase()
}

export function useOrderShipmentRealtime({ shopId, accountId, orderId }: Params) {
  const queryClient = useQueryClient()
  const invalidateTimer = React.useRef<number | null>(null)

  const scheduleInvalidate = React.useCallback(
    (keys: Array<unknown[]>) => {
      if (invalidateTimer.current) window.clearTimeout(invalidateTimer.current)
      invalidateTimer.current = window.setTimeout(() => {
        keys.forEach((queryKey) => {
          void queryClient.invalidateQueries({ queryKey })
        })
      }, 800)
    },
    [queryClient],
  )

  React.useEffect(() => {
    void ordersHub.start().catch(() => {
      // Non-fatal: app still works without realtime
    })

    const unsub = ordersHub.onStatusUpdated((payload: OrderShipmentRealtimePayload) => {
      const pShop = payload.shopId
      const pAccount = payload.accountId
      const pOrder = payload.orderId

      // If hook is scoped, ignore payloads outside scope.
      if (shopId && pShop !== shopId) return
      if (accountId && pAccount !== accountId) return
      if (orderId && pOrder !== orderId) return

      const shipNew = upper(payload.shipmentNewStatus)
      const ordNew = upper(payload.orderNewStatus)
      const occurredAt = payload.occurredAt

      const invalidateKeys: Array<unknown[]> = []

      if (shopId) {
        // Update seller shipments list cache
        queryClient.setQueryData<ShipmentDto[] | undefined>([SHIP_QUERY_KEY, shopId], (prev) => {
          if (!prev?.length) return prev
          let touched = false
          const next = prev.map((s) => {
            if (s.shipmentId !== payload.shipmentId) return s
            touched = true
            return {
              ...s,
              status: shipNew,
              updatedAt: occurredAt ?? s.updatedAt ?? s.createdAt,
            }
          })
          if (!touched) invalidateKeys.push([SHIP_QUERY_KEY, shopId])
          return next
        })

        // Update seller orders list cache
        queryClient.setQueryData<SellerOrder[] | undefined>(['seller-shop-orders', shopId], (prev) => {
          if (!prev?.length) return prev
          let touched = false
          const next = prev.map((o) => {
            if (o.orderId !== payload.orderId) return o
            const current = upper(o.status)
            const shouldUpdate = payload.orderRowUpdated || (ordNew && ordNew !== current)
            if (!shouldUpdate) return o
            touched = true
            return { ...o, status: ordNew, updatedAt: occurredAt ?? o.updatedAt }
          })
          if (!touched) invalidateKeys.push(['seller-shop-orders', shopId])
          return next
        })

        // If shipment updated but order row not updated yet, refetch shortly for consistency.
        if (invalidateKeys.length) scheduleInvalidate(invalidateKeys)
      }

      if (accountId) {
        const buyerKey = [...queryKeys.orders.all(), 'account', accountId] as unknown[]
        queryClient.setQueryData<BuyerOrder[] | undefined>(buyerKey, (prev) => {
          if (!prev?.length) return prev
          let touched = false
          const next = prev.map((o) => {
            if (o.orderId !== payload.orderId) return o
            const current = upper(o.status)
            const shouldUpdate = payload.orderRowUpdated || (ordNew && ordNew !== current)
            if (!shouldUpdate) return o
            touched = true
            return { ...o, status: ordNew, updatedAt: occurredAt ?? o.updatedAt }
          })
          if (!touched) scheduleInvalidate([buyerKey as unknown[]])
          return next
        })
      }
    })

    return () => {
      if (invalidateTimer.current) window.clearTimeout(invalidateTimer.current)
      unsub()
    }
  }, [accountId, orderId, queryClient, scheduleInvalidate, shopId])

  React.useEffect(() => {
    if (shopId) void ordersHub.joinShopGroup(shopId).catch(() => {})
  }, [shopId])

  React.useEffect(() => {
    if (accountId) void ordersHub.joinAccountGroup(accountId).catch(() => {})
  }, [accountId])

  React.useEffect(() => {
    if (orderId) void ordersHub.joinOrderGroup(orderId).catch(() => {})
  }, [orderId])
}

