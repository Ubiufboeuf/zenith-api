import type { CURRENCIES } from '@/lib/constants'
import type { createSalePaymentSchema } from '@/schemas/paymentsSchemas'
import type z from 'zod'

export type Currency = keyof typeof CURRENCIES

export type CreateSalePayment = z.infer<typeof createSalePaymentSchema>
