import { CURRENCIES } from '@/lib/constants/currencies'
import { PAYMENT_STATUS, SALE_STATUS } from '@/lib/constants/sales'
import z from 'zod'
import { createSaleProductSchema } from './productsSchemas'
import { createSalePaymentSchema } from './paymentsSchemas'

export const saleBodySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  last_modified: z.string(),
  total: z.number(),
  total_discount: z.number(),
  currency: z.enum(CURRENCIES),
  products: z.array(createSaleProductSchema),
  payments: z.array(createSalePaymentSchema).optional(),
  status: z.enum(SALE_STATUS),
  payment_status: z.enum(PAYMENT_STATUS),
  client_id: z.string().optional(),
  user_id: z.string()
})

export const createSaleBodySchema = saleBodySchema.omit({
  id: true,
  last_modified: true
})

export const editSaleBodySchema = createSaleBodySchema.partial()
