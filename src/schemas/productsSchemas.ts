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
  codes: z.array(ProductCodeSchema).default([])
})

export const ProductWithEventsSchema = ProductsRowSchema.extend({
  events: z.array(ProductEventsRowSchema).default([])
})

export const ProductFullSchema = ProductSchema.extend({
  events: z.array(ProductEventsRowSchema).default([])
})

export const CreateProductSchema = ProductSchema
  .partial()
  .required({ id: true })
  .extend({
    codes: z.array(
      ProductCodeSchema
        .omit({ id: true })
        .partial({ is_main: true })
    )
    .default([])
    .optional()
  })

export const StrictCreateProductSchema = CreateProductSchema.required({
  title: true,
  cost_price: true,
  cost_currency: true,
  sale_price: true,
  sale_currency: true
})
