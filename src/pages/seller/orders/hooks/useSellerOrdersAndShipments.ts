import { useQuery } from '@tanstack/react-query'
import { orderService, shipmentService } from '@/services'
import { useShopStore } from '@/store/shopStore'
import { SHIP_QUERY_KEY, buildShipmentByOrderIdMap } from '../shipmentSellerUi'
import React from 'react'

export function useSellerOrdersAndShipments() {
  const shop = useShopStore((s) => s.shop)
  const shopId = shop?.shopId

  const ordersQuery = useQuery({
    queryKey: ['seller-shop-orders', shopId],
    queryFn: () => orderService.getShopOrders(shopId!),
    enabled: !!shopId,
  })

  const shipmentsQuery = useQuery({
    queryKey: [SHIP_QUERY_KEY, shopId],
    queryFn: () => shipmentService.listShipmentsByShop(shopId!),
    enabled: !!shopId,
  })

  const shipmentByOrderId = React.useMemo(
    () => buildShipmentByOrderIdMap(shipmentsQuery.data ?? []),
    [shipmentsQuery.data],
  )

  return {
    shopId,
    orders: ordersQuery.data ?? [],
    shipments: shipmentsQuery.data ?? [],
    shipmentByOrderId,
    isLoading: ordersQuery.isLoading || shipmentsQuery.isLoading,
    isError: ordersQuery.isError || shipmentsQuery.isError,
    error: ordersQuery.error ?? shipmentsQuery.error,
    refetch: () => {
      void ordersQuery.refetch()
      void shipmentsQuery.refetch()
    },
  }
}
