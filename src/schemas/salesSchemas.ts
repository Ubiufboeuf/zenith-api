import z from 'zod'
import { SaleDetailsRowSchema, SalePaymentsRowSchema, SalesRowSchema } from './db'

export const SaleSchema = SalesRowSchema

export const SaleWithDetailsSchema = SaleSchema.extend({
  details: z.array(SaleDetailsRowSchema)  
})

export const SaleWithPaymentsSchema = SaleSchema.extend({
  payments: z.array(SalePaymentsRowSchema)  
})

export const SaleFullSchema = SaleSchema.extend({
  details: z.array(SaleDetailsRowSchema),
  payments: z.array(SalePaymentsRowSchema)
})
