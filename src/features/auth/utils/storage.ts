import { APP_CONFIG } from '@/constants'
import type { UserRole } from '@/types'

export interface StoredUser {
  email: string
  username: string
  fullName?: string
  /** App role used for route guards (customer | seller | admin) */
  role?: UserRole
  /** Backend display name when available (e.g. "Customer", "Admin") */
  roleName?: string
  accountId?: string
}

const VALID_USER_ROLES: UserRole[] = ['customer', 'seller', 'admin']

const LEGACY_USER_KEYS = {
  NAME: 'user_name',
  EMAIL: 'user_email',
  ROLE: 'user_role',
  ID: 'user_id',
}

const isBrowser = typeof window !== 'undefined'

const sanitizeRole = (role: string | null): UserRole | undefined => {
  if (!role) return undefined
  return VALID_USER_ROLES.includes(role as UserRole) ? (role as UserRole) : undefined
}

/**
 * Read user data from localStorage. Falls back to legacy individual keys.
 */
export const readStoredUser = (): StoredUser | null => {
  if (!isBrowser) return null

  const serialized = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER)
  if (serialized) {
    try {
      const parsed = JSON.parse(serialized) as StoredUser
      if (parsed && parsed.username) {
        return parsed
      }
    } catch (error) {
      console.warn('Unable to parse stored user data', error)
    }
  }

  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
  const username = localStorage.getItem(LEGACY_USER_KEYS.NAME)
  if (!token || !username) {
    return null
  }

  const email = localStorage.getItem(LEGACY_USER_KEYS.EMAIL) || ''
  const storedRole = sanitizeRole(localStorage.getItem(LEGACY_USER_KEYS.ROLE))

  return {
    email,
    username,
    role: storedRole,
  }
}

/**
 * Persist user data to localStorage (consolidated approach).
 * Only stores non-sensitive display data (email, username, role).
 * AccountId should be fetched from /auth/me endpoint when needed.
 */
export const persistStoredUser = (user: StoredUser) => {
  if (!isBrowser) return
  try {
    // Only store consolidated user_data - this is the modern approach
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user))
  } catch (error) {
    console.warn('Unable to persist user data', error)
  }

  // Clean up all legacy keys to reduce localStorage clutter
  localStorage.removeItem(LEGACY_USER_KEYS.NAME)
  localStorage.removeItem(LEGACY_USER_KEYS.EMAIL)
  localStorage.removeItem(LEGACY_USER_KEYS.ROLE)
  localStorage.removeItem(LEGACY_USER_KEYS.ID)
}

export const clearStoredUser = () => {
  if (!isBrowser) return
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
  localStorage.removeItem(LEGACY_USER_KEYS.NAME)
  localStorage.removeItem(LEGACY_USER_KEYS.EMAIL)
  localStorage.removeItem(LEGACY_USER_KEYS.ROLE)
  localStorage.removeItem(LEGACY_USER_KEYS.ID)
}
