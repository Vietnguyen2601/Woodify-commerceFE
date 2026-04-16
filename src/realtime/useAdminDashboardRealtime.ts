import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/services'
import {
  adminDashboardHub,
  type DashboardHubErrorPayload,
  type RealtimeMetricsDto,
} from './adminDashboardHub'

type DashboardSnapshotLike = {
  revenueToday?: number
  ordersToday?: number
  totalUsers?: number
}

type Params = {
  enabled?: boolean
}

function readNumber(
  source: RealtimeMetricsDto,
  keys: Array<keyof RealtimeMetricsDto | string>,
): number {
  for (const key of keys) {
    const value = source[key as keyof RealtimeMetricsDto]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

export function useAdminDashboardRealtime({ enabled = true }: Params = {}) {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (!enabled) return

    void adminDashboardHub.start().then(() => {
      // Server already pushes every 5s, but this gets latest immediately after connect.
      void adminDashboardHub.requestLatestMetrics().catch(() => {})
    }).catch(() => {
      // Non-fatal: dashboard keeps using REST query.
    })

    const unsubscribeMetrics = adminDashboardHub.onTodayMetrics((rawPayload: RealtimeMetricsDto) => {
      const gross = readNumber(rawPayload, ['GrossRevenue', 'grossRevenue'])
      const commission = readNumber(rawPayload, ['CommissionRevenue', 'commissionRevenue'])
      const net = readNumber(rawPayload, ['NetRevenue', 'netRevenue']) || Math.max(0, gross - commission)
      const ordersToday = readNumber(rawPayload, ['OrdersToday', 'ordersToday'])
      const totalUsers = readNumber(rawPayload, ['TotalUsers', 'totalUsers'])

      queryClient.setQueryData(queryKeys.admin.revenue('day'), {
        labels: ['Today'],
        gross: [gross],
        commission: [commission],
        net: [net],
      })

      queryClient.setQueryData<DashboardSnapshotLike | undefined>(queryKeys.admin.snapshot(), (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          revenueToday: gross,
          ordersToday,
          totalUsers: totalUsers || prev.totalUsers,
        }
      })
    })

    const unsubscribeError = adminDashboardHub.onError((payload: DashboardHubErrorPayload) => {
      if (!payload?.message) return
      if (import.meta.env.DEV) {
        // Keep this as debug-only because backend already returns REST fallback data.
        // eslint-disable-next-line no-console
        console.warn('[DashboardHub] ReceiveTodayMetrics error:', payload.message)
      }
    })

    return () => {
      unsubscribeMetrics()
      unsubscribeError()
    }
  }, [enabled, queryClient])
}
