import { CURRENCIES } from '@/lib/constants'
import z from 'zod'
import { createSaleProductSchema } from './productsSchemas'
import { createSalePaymentSchema } from './paymentsSchemas'

export const saleBodySchema = z.object({
  id: z.string(),
  // state: 'pending' // ej, si no hay pago, queda pendiente, pero la venta se guarda
  date: z.string(),
  total: z.number(),
  total_discount: z.number(),
  currency: z.enum(CURRENCIES),
  products: z.array(createSaleProductSchema),
  payments: z.array(createSalePaymentSchema).optional()
  // modified: boolean // para saber si la venta se ha modificado en algún momento
})

export const createSaleBodySchema = z.object({
  // state: 'pending' // ej, si no hay pago, queda pendiente, pero la venta se guarda
  date: z.string(),
  total: z.number(),
  total_discount: z.number(),
  currency: z.enum(CURRENCIES),
  products: z.array(createSaleProductSchema),
  payments: z.array(createSalePaymentSchema).optional()
})

export const editSaleBodySchema = saleBodySchema
  .omit({
    id: true
  })
  .partial()
