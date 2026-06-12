import { CURRENCIES } from '@/lib/constants'
import z from 'zod'

export const salePaymentSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  amount_paid: z.number(),
  currency: z.enum(CURRENCIES),
  exchange_rate: z.number()
  // método de pago (efectivo, débito, transferencia, etc)
})

export const createSalePaymentSchema = z.object({
  amount_paid: z.number(),
  currency: z.enum(CURRENCIES),
  exchange_rate: z.number()
  // método de pago (efectivo, débito, transferencia, etc)
})
