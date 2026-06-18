import { CURRENCIES } from '@/lib/constants/currencies'
import { DOCUMENT_TYPES, PAYMENT_STATUS, SALE_STATUS, SALE_TYPES } from '@/lib/constants/sales'
import z from 'zod'
import { createSaleProductSchema } from './productsSchemas'
import { createSalePaymentSchema } from './paymentsSchemas'

export const saleDetailsSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  product_id: z.string(),
  quantity: z.number(),
  unir_price_at_moment: z.int(),
  currency: z.enum(CURRENCIES),
  discount: z.int()
})

export const saleSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  last_modified: z.string(),
  total: z.int(),
  total_discount: z.int(),
  general_discount: z.int(),
  currency: z.enum(CURRENCIES),
  status: z.enum(SALE_STATUS),
  payment_status: z.enum(PAYMENT_STATUS),
  document_type: z.enum(DOCUMENT_TYPES),
  sale_type: z.enum(SALE_TYPES),
  client_id: z.string().optional(),
  user_id: z.string(),
  products: z.array(createSaleProductSchema),
  payments: z.array(createSalePaymentSchema).optional(),
  details: z.array(saleDetailsSchema)
})

export const createSaleBodySchema = saleSchema.omit({
  id: true,
  last_modified: true
})

export const editSaleBodySchema = createSaleBodySchema.partial()
