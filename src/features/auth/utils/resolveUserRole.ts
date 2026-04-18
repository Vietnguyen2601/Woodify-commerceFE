import type { UserRole } from '@/types'

/**
 * Map backend display names (e.g. "Customer", "Admin") to app roles.
 */
export function mapRoleNameToUserRole(roleName: string | null | undefined): UserRole | undefined {
  if (!roleName) return undefined
  const key = roleName.trim().toLowerCase()
  if (key === 'admin' || key === 'administrator') return 'admin'
  if (key === 'seller' || key === 'shop' || key === 'merchant') return 'seller'
  if (
    key === 'customer' ||
    key === 'buyer' ||
    key === 'member' ||
    key === 'user' ||
    key === 'client'
  ) {
    return 'customer'
  }
  return undefined
}

function parseRoleFromJwt(token: string | null | undefined): UserRole | undefined {
  if (!token) return undefined
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const role = String(payload?.role ?? payload?.Role ?? '').toLowerCase()
    return mapRoleNameToUserRole(role)
  } catch {
    return undefined
  }
}

type LoginLikePayload = Record<string, unknown> & {
  token?: string
  roleName?: string
  RoleName?: string
  role?: string
  Role?: string
}

/**
 * Prefer explicit API role fields, then JWT claims, then customer.
 */
export function resolveRoleFromLoginPayload(payload: LoginLikePayload): UserRole {
  const fromApiName = mapRoleNameToUserRole(
    (payload.roleName as string) || (payload.RoleName as string) || undefined
  )
  if (fromApiName) return fromApiName

  const fromRoleField = mapRoleNameToUserRole(
    (payload.role as string) || (payload.Role as string) || undefined
  )
  if (fromRoleField) return fromRoleField

  return parseRoleFromJwt(payload.token as string | undefined) ?? 'customer'
}

export function resolveRoleNameFromLoginPayload(payload: LoginLikePayload): string | undefined {
  const raw =
    (payload.roleName as string) ||
    (payload.RoleName as string) ||
    (payload.role as string) ||
    (payload.Role as string)
  return raw?.trim() || undefined
}
