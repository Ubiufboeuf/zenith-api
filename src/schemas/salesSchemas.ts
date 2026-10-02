import z from 'zod'
import { SaleDetailsRowSchema, SalePaymentsRowSchema, SalesRowSchema } from './dbSchemas'
import { SALE_DOCUMENT_TYPE, SALE_TYPE } from '@/lib/constants/salesConstants'
import { CURRENCIES } from '@/lib/constants/currenciesConstants'
import { PAYMENT_METHODS } from '@/lib/constants/paymentsConstants'

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

export const SalePayloadSchema = z.object({
  documentType: z.enum(SALE_DOCUMENT_TYPE),
  saleType: z.enum(SALE_TYPE),
  currency: z.enum(CURRENCIES),
  exchangeRate: z.number().optional(),

  userId: z.string().nullable(),
  cashierId: z.string(),
  clientId: z.string().nullable(),

  subtotal: z.number(),
  totalDiscount: z.number(),
  generalDiscount: z.number(),
  total: z.number(),

  details: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    unitPriceAtMoment: z.number(),
    ivaRate: z.number(),
    discount: z.number(),
    currency: z.enum(CURRENCIES)
  })),

  payments: z.array(z.object({
    currency: z.enum(CURRENCIES),
    amountPaid: z.number(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    exchangeRate: z.number().optional(),
    createdAt: z.string().optional(),
    reference: z.string().optional()
  })),

  notes: z.string().optional()
})
