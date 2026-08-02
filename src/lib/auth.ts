'use client'

export interface StoredUser {
  fullName: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface LoggedInUser {
  fullName: string
  email: string
}

const USERS_KEY = 'docuguard_users'
const SESSION_KEY = 'docuguard_logged_in_user'

// ---- Password hashing (SHA-256 via Web Crypto) ---------------------
// Never store plaintext passwords in localStorage. The hash is still
// client-side only — this app is a demo, not a production auth system.
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ---- User store -----------------------------------------------------
export function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

export function getLoggedInUser(): LoggedInUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as LoggedInUser) : null
  } catch {
    return null
  }
}

export function setLoggedInUser(user: LoggedInUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('auth-state-change'))
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('auth-state-change'))
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}
