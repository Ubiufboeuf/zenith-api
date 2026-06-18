import { CURRENCIES, DEFAULT_CURRENCY } from '@/lib/constants/currencies'
import { PAYMENT_METHODS } from '@/lib/constants/sales'
import z from 'zod'

export const salePaymentSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  amount_paid: z.int(),
  currency: z.enum(CURRENCIES),
  exchange_rate: z.number(),
  payment_method: z.enum(PAYMENT_METHODS),
  created_at: z.string()
})

export const createSalePaymentSchema = salePaymentSchema.omit({
  id: true,
  sale_id: true,
  created_at: true
})
