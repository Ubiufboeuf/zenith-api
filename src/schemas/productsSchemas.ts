import z from 'zod'
import { ProductCodesRowSchema, ProductEventsRowSchema, ProductsRowSchema } from './db'

export const ProductSchema = ProductsRowSchema.extend({
  codes: z.array(ProductCodesRowSchema)
})

export const ProductFullSchema = ProductSchema.extend({
  events: z.array(ProductEventsRowSchema)
})
