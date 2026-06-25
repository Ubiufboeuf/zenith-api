/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod'
import { ProductCodesRowSchema, ProductEventsRowSchema, ProductsRowSchema } from './db'

export const ProductCodeSchema = ProductCodesRowSchema.extend({
  is_main: z.boolean().catch((ctx: any) => {
    if (!ctx) return false
    if (typeof ctx === 'number') return ctx === 1
    return ctx === '1'
  })
})

export const ProductSchema = ProductsRowSchema.extend({
  codes: z.array(ProductCodeSchema)
})

export const ProductFullSchema = ProductSchema.extend({
  events: z.array(ProductEventsRowSchema)
})
