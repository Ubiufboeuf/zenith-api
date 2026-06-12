import z from 'zod'

export const productSchema = z.object({
  id: z.string(),
  barcode: z.string(),
  qrcode: z.string().nullable(),
  description: z.string(),
  cost_price: z.number(),
  cost_currency: z.string(),
  sale_price: z.number(),
  sale_currency: z.string(),
  stock: z.number()
})

export const createSaleProductSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
  unit_price_at_moment: z.number(),
  discount: z.number()
})
