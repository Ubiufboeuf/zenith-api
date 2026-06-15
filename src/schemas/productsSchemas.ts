import { CURRENCIES } from '@/lib/constants'
import z from 'zod'

export const productSchema = z.object({
  id: z.string(),
  barcode: z.string().nullable(),
  qrcode: z.string().nullable(),
  description: z.string(),
  cost_price: z.number(),
  cost_currency: z.enum(CURRENCIES),
  sale_price: z.number(),
  sale_currency: z.enum(CURRENCIES),
  stock: z.number()
})

export const createProductSchema = productSchema.omit({
  id: true
})

export const createProductBodySchema = createProductSchema.partial()

export const createSaleProductSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
  unit_price_at_moment: z.number(),
  currency: z.enum(CURRENCIES),
  discount: z.number()
})
