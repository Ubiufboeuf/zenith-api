import z from 'zod'
import { SaleDetailsRowSchema, SalePaymentsRowSchema, SalesRowSchema } from './db'

export const SaleSchema = SalesRowSchema

export const SaleDetailSchema = SaleDetailsRowSchema
export const SaleWithDetailsSchema = SaleSchema.extend({
  details: z.array(SaleDetailSchema)
})

export const SalePaymentSchema = SalePaymentsRowSchema
export const SaleWithPaymentsSchema = SaleSchema.extend({
  payments: z.array(SalePaymentSchema)  
})

export const SaleFullSchema = SaleSchema.extend({
  details: z.array(SaleDetailSchema),
  payments: z.array(SalePaymentSchema)
})
