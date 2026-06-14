export const {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  PORT = 1234
} = process.env

export const CURRENCIES = ['$', 'U$S', '€'] as const

export const REASONS = {
  ID_NOT_FOUND: 'ID_NOT_FOUND'
} as const
