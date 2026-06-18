import type { DOCUMENT_TYPES, PAYMENT_METHODS, PAYMENT_STATUS, SALE_STATUS, SALE_TYPES } from '@/lib/constants/sales'
import type { createSaleBodySchema, editSaleBodySchema, saleSchema } from '@/schemas/salesSchemas'
import type z from 'zod'

export type SaleStatus = typeof SALE_STATUS[number]
export type PaymentStatus = typeof PAYMENT_STATUS[number]
export type DocumentTypes = typeof DOCUMENT_TYPES[number]
export type SaleTypes = typeof SALE_TYPES[number]
export type PaymentMethods = typeof PAYMENT_METHODS[number]

export type Sale = z.infer<typeof saleSchema>
export type CreateSaleBody = z.infer<typeof createSaleBodySchema>
export type EditSaleBody = z.infer<typeof editSaleBodySchema>
