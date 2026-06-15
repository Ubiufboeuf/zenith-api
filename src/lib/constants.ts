export const {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  PORT = 1234
} = process.env

export const CURRENCIES = ['UYU', 'USD', 'EUR'] as const // ISO 4217
export const DEFAULT_CURRENCY: typeof CURRENCIES[number] = 'UYU'
export const SALE_STATUS = ['CANCELLED', 'PENDING', 'COMPLETED'] as const
export const PAYMET_STATUS = ['PAID', 'PARTIAL', 'OWED', 'REFUNDED', 'VOIDED'] as const

export const REASONS = {
  ID_NOT_FOUND: 'ID_NOT_FOUND'
} as const
