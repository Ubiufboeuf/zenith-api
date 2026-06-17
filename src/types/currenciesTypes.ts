import type { CURRENCIES } from '@/lib/constants/currencies'
import type { createSalePaymentSchema } from '@/schemas/paymentsSchemas'
import type z from 'zod'

export type Currency = typeof CURRENCIES[number]

export type CreateSalePayment = z.infer<typeof createSalePaymentSchema>
