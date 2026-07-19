import type { ZodError } from 'zod'

export type Validation<T> = {
  success: true
  data: T
} | {
  success: false
  error: ZodError | string
  status?: number
  userFriendlyError: ZodError | string
}
