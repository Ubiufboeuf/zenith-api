import { CURRENCIES, DEFAULT_CURRENCY } from '@/lib/constants/currencies'
import { PRODUCT_CODE_KINDS } from '@/lib/constants/products'
import z from 'zod'

export const productCodeSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  code: z.string(),
  type: z.enum(PRODUCT_CODE_KINDS),
  is_main: z.boolean()
})

export const productSchema = z.object({
  id: z.string(),
  description: z.string(),
  cost_price: z.int(),
  cost_currency: z.enum(CURRENCIES),
  sale_price: z.int(),
  sale_currency: z.enum(CURRENCIES),
  stock: z.number(),
  codes: z.array(productCodeSchema)
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
