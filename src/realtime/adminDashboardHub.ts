import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'

export type RealtimeMetricsDto = {
  Timestamp?: string
  GrossRevenue?: number | string
  CommissionRevenue?: number | string
  NetRevenue?: number | string
  GrossRevenueGrowth?: number | string | null
  CommissionGrowth?: number | string | null
  NetRevenueGrowth?: number | string | null
  TotalUsers?: number | string
  NewUsers?: number | string
  NewUsersGrowth?: number | string | null
  ActiveUsersToday?: number | string
  OrdersToday?: number | string
  CompletedOrdersToday?: number | string
  PendingOrdersCount?: number | string
  AverageOrderValueToday?: number | string | null
  CacheStatus?: string
  CacheTTL?: number | string | null
}

export type DashboardHubErrorPayload = {
  message?: string
}

type MetricsHandler = (payload: RealtimeMetricsDto) => void
type ErrorHandler = (payload: DashboardHubErrorPayload) => void

function normalizeBaseUrl(input: string): string {
  const s = (input || '').trim()
  if (!s) return ''
  return s.endsWith('/') ? s.slice(0, -1) : s
}

function resolveDashboardHubUrl(): string {
  const adminBase = normalizeBaseUrl(String(import.meta.env.VITE_ADMIN_SERVICE_URL ?? ''))
  if (adminBase) return `${adminBase}/admin-dashboard-hub`

  // Dashboard hub is hosted by Order service in current backend topology.
  const orderBase = normalizeBaseUrl(String(import.meta.env.VITE_ORDER_SERVICE_URL ?? ''))
  if (orderBase) return `${orderBase}/admin-dashboard-hub`

  const apiBase = normalizeBaseUrl(String(import.meta.env.VITE_API_URL ?? ''))
  const gatewayBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
  if (gatewayBase) return `${gatewayBase}/admin-dashboard-hub`

  return ''
}

class AdminDashboardHub {
  private connection: HubConnection | null = null
  private startPromise: Promise<void> | null = null
  private metricHandlers = new Set<MetricsHandler>()
  private errorHandlers = new Set<ErrorHandler>()

  private ensureConnection(): HubConnection {
    if (this.connection) return this.connection

    const url = resolveDashboardHubUrl()
    if (!url) {
      throw new Error('AdminDashboardHub: missing hub base url (set VITE_ADMIN_SERVICE_URL or VITE_API_URL)')
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    this.connection.on('ReceiveTodayMetrics', (payload: RealtimeMetricsDto) => {
      this.metricHandlers.forEach((h) => h(payload))
    })

    this.connection.on('Error', (payload: DashboardHubErrorPayload) => {
      this.errorHandlers.forEach((h) => h(payload))
    })

    return this.connection
  }

  async start(): Promise<void> {
    const conn = this.ensureConnection()
    if (conn.state === HubConnectionState.Connected) return

    if (!this.startPromise) {
      this.startPromise = conn
        .start()
        .catch((e) => {
          this.startPromise = null
          throw e
        })
        .then(() => undefined)
    }

    await this.startPromise
  }

  onTodayMetrics(handler: MetricsHandler): () => void {
    this.metricHandlers.add(handler)
    return () => this.metricHandlers.delete(handler)
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler)
    return () => this.errorHandlers.delete(handler)
  }

  async requestLatestMetrics(): Promise<void> {
    await this.start()
    await this.connection!.invoke('RequestLatestMetrics')
  }
}

export const adminDashboardHub = new AdminDashboardHub()
