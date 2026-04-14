import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'

export type OrderShipmentRealtimePayload = {
  shipmentId: string
  orderId: string
  shopId: string
  accountId: string
  shipmentPreviousStatus?: string | null
  shipmentNewStatus: string
  orderPreviousStatus?: string | null
  orderNewStatus: string
  orderRowUpdated: boolean
  occurredAt: string
}

type StatusUpdatedHandler = (payload: OrderShipmentRealtimePayload) => void

function normalizeBaseUrl(input: string): string {
  const s = (input || '').trim()
  if (!s) return ''
  return s.endsWith('/') ? s.slice(0, -1) : s
}

function resolveOrdersHubUrl(): string {
  // Prefer explicit order service url, else fall back to API gateway base (strip trailing /api).
  const orderBase = normalizeBaseUrl(String(import.meta.env.VITE_ORDER_SERVICE_URL ?? ''))
  if (orderBase) return `${orderBase}/hubs/orders`

  const apiBase = normalizeBaseUrl(String(import.meta.env.VITE_API_URL ?? ''))
  const gatewayBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
  if (gatewayBase) return `${gatewayBase}/hubs/orders`

  return ''
}

class OrdersHub {
  private connection: HubConnection | null = null
  private startPromise: Promise<void> | null = null
  private handlers = new Set<StatusUpdatedHandler>()

  private ensureConnection(): HubConnection {
    if (this.connection) return this.connection

    const url = resolveOrdersHubUrl()
    if (!url) {
      throw new Error('OrdersHub: missing hub base url (set VITE_ORDER_SERVICE_URL or VITE_API_URL)')
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning)
      .build()

    this.connection.on('OrderShipmentStatusUpdated', (payload: OrderShipmentRealtimePayload) => {
      this.handlers.forEach((h) => h(payload))
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
          // Allow later retries
          this.startPromise = null
          throw e
        })
        .then(() => undefined)
    }
    return this.startPromise
  }

  onStatusUpdated(handler: StatusUpdatedHandler): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  async joinOrderGroup(orderId: string): Promise<void> {
    if (!orderId) return
    await this.start()
    await this.connection!.invoke('JoinOrderGroup', orderId)
  }

  async joinShopGroup(shopId: string): Promise<void> {
    if (!shopId) return
    await this.start()
    await this.connection!.invoke('JoinShopGroup', shopId)
  }

  async joinAccountGroup(accountId: string): Promise<void> {
    if (!accountId) return
    await this.start()
    await this.connection!.invoke('JoinAccountGroup', accountId)
  }
}

export const ordersHub = new OrdersHub()

